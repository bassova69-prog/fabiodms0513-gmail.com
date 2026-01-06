
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const sql = neon(DB_URL);

  try {
    await sql`CREATE TABLE IF NOT EXISTS beats (
      id TEXT PRIMARY KEY,
      data JSONB
    );`;

    if (request.method === 'GET') {
      const { limit } = request.query;
      const limitVal = Array.isArray(limit) ? limit[0] : limit;

      let beats;
      if (limitVal && !isNaN(Number(limitVal))) {
        const limitNum = Number(limitVal);
        beats = await sql`SELECT data FROM beats LIMIT ${limitNum}`;
      } else {
        beats = await sql`SELECT data FROM beats`;
      }
      
      const enrichedBeats = beats.map((row) => {
        try {
            // Aplatissement : si data contient une propriété "data", on remonte d'un cran
            let beatData = row.data || {};
            if (beatData.data) {
                beatData = { ...beatData, ...beatData.data };
                delete beatData.data;
            }
            
            if (!beatData.id && row.id) {
                beatData.id = row.id;
            }

            // Réparation date
            if (!beatData.date) {
                if (beatData.id && typeof beatData.id === 'string' && beatData.id.startsWith('beat-')) {
                    const parts = beatData.id.split('-');
                    if (parts.length > 1) {
                        const timestamp = parseInt(parts[1], 10);
                        if (!isNaN(timestamp) && timestamp > 1600000000000) {
                            beatData.date = new Date(timestamp).toISOString();
                        } else {
                            beatData.date = new Date().toISOString();
                        }
                    } else {
                        beatData.date = new Date().toISOString();
                    }
                } else {
                    beatData.date = new Date().toISOString();
                }
            }
            return beatData;
        } catch (e) {
            return null;
        }
      }).filter(Boolean);

      enrichedBeats.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });

      return response.status(200).json(enrichedBeats);
    }

    if (request.method === 'POST') {
      const body = request.body;
      
      if (!body) {
        return response.status(400).json({ error: 'Body invalide ou vide' });
      }

      // Nettoyage : On s'assure de ne pas avoir de structure { data: { ... } }
      // Si l'utilisateur envoie { beat: {...} } ou { data: {...} }, on extrait le contenu.
      let beat = body.beat || body.data || body;

      if (!beat.id) {
        beat.id = `beat-${Date.now()}`;
      }

      // Si c'est une mise à jour, on s'assure de garder la date de création originale si elle n'est pas fournie
      if (!beat.date) {
         // On ne force pas la date ici si c'est un update partiel, la DB gérera
      } else {
         // Si date fournie, on s'assure qu'elle est ISO
         try { beat.date = new Date(beat.date).toISOString(); } catch(e) {}
      }

      const beatId = beat.id;
      const beatJson = JSON.stringify(beat);

      // CRITICAL UPDATE: Utilisation de `beats.data || ...` pour fusionner (MERGE) au lieu d'écraser
      // Si l'ID existe, on prend les anciennes données (beats.data) et on les fusionne avec les nouvelles.
      // Si l'ID n'existe pas, on insère le nouveau JSON.
      
      await sql`
        INSERT INTO beats (id, data)
        VALUES (${beatId}, ${beatJson}::jsonb)
        ON CONFLICT (id) DO UPDATE
        SET data = beats.data || ${beatJson}::jsonb;
      `;
      
      return response.status(200).json({ success: true, id: beatId });
    }

    if (request.method === 'DELETE') {
      const { id } = request.query;
      const idVal = Array.isArray(id) ? id[0] : id;
      
      if (!idVal) {
        return response.status(400).json({ error: 'ID manquant' });
      }
      
      await sql`DELETE FROM beats WHERE id = ${idVal}`;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    console.error('Database Error:', error);
    return response.status(500).json({ 
        error: 'Erreur serveur base de données', 
        details: error.message 
    });
  }
}
