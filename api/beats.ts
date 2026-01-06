
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const sql = neon(DB_URL);

  try {
    // Création table si inexistante
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
        beats = await sql`SELECT id, data FROM beats LIMIT ${limitNum}`;
      } else {
        beats = await sql`SELECT id, data FROM beats`;
      }
      
      const enrichedBeats = beats.map((row) => {
        try {
            let beatData = row.data || {};

            // 1. Déballage : Si les données sont imbriquées dans "data" ou "beat"
            if (beatData.data) {
                beatData = { ...beatData, ...beatData.data };
                delete beatData.data;
            }
            if (beatData.beat) {
                beatData = { ...beatData, ...beatData.beat };
                delete beatData.beat;
            }
            
            // 2. Garantie de l'ID : On utilise la clé primaire si l'ID manque dans le JSON
            if (!beatData.id && row.id) {
                beatData.id = row.id;
            }

            // 3. Valeurs par défaut pour affichage coûte que coûte
            if (!beatData.title) {
                beatData.title = "Beat sans titre"; 
            }
            if (!beatData.coverUrl) {
                beatData.coverUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80";
            }
            if (!beatData.licenses) {
                beatData.licenses = [];
            }

            // 4. Gestion Date
            if (!beatData.date) {
                // Tentative d'extraction du timestamp depuis l'ID (ex: beat-170...)
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
            console.error("Erreur parsing row:", e);
            // En cas d'erreur de parsing grave, on renvoie au moins l'ID pour debug
            return { id: row.id, title: "Données corrompues", date: new Date().toISOString() };
        }
      }).filter(Boolean);

      // Tri par date décroissante
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

      // Nettoyage structure à la source pour les futurs ajouts
      let beat = body.beat || body.data || body;

      if (!beat.id) {
        beat.id = `beat-${Date.now()}`;
      }

      if (!beat.date) {
         // Si date non fournie lors de la création/update
      } else {
         try { beat.date = new Date(beat.date).toISOString(); } catch(e) {}
      }

      const beatId = beat.id;
      const beatJson = JSON.stringify(beat);

      // Utilisation du merge JSONB (||) pour ne pas écraser les champs existants lors d'un update partiel
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
