
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

// Note: On retire l'import de crypto qui peut faire planter certaines runtimes serverless si inutilisé.

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
        // Optimisation pour le checkConnection
        const limitNum = Number(limitVal);
        beats = await sql`SELECT data FROM beats LIMIT ${limitNum}`;
      } else {
        beats = await sql`SELECT data FROM beats`;
      }
      
      const enrichedBeats = beats.map((row) => {
        try {
            const beatData = row.data || {};
            
            // Correction ID si manquant dans le JSON mais présent en clé primaire
            if (!beatData.id && row.id) {
                beatData.id = row.id;
            }

            // Réparation de la date via l'ID (timestamp)
            if (!beatData.date) {
                if (beatData.id && typeof beatData.id === 'string' && beatData.id.startsWith('beat-')) {
                    const parts = beatData.id.split('-');
                    if (parts.length > 1) {
                        const timestamp = parseInt(parts[1], 10);
                        // Si le timestamp est valide (> année 2020)
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
            console.warn("Row corrupt:", row);
            return null;
        }
      }).filter(Boolean);

      // Tri par date décroissante (plus récent en premier)
      // Utilisation sécurisée de getTime() pour éviter les crashs sur date invalide
      enrichedBeats.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });

      return response.status(200).json(enrichedBeats);
    }

    if (request.method === 'POST') {
      const beat = request.body;
      
      if (!beat) {
        return response.status(400).json({ error: 'Body invalide ou vide' });
      }

      if (!beat.id) {
        beat.id = `beat-${Date.now()}`;
      }

      if (!beat.date) {
        beat.date = new Date().toISOString();
      }

      const beatJson = JSON.stringify(beat);

      await sql`
        INSERT INTO beats (id, data)
        VALUES (${beat.id}, ${beatJson}::jsonb)
        ON CONFLICT (id) DO UPDATE
        SET data = ${beatJson}::jsonb;
      `;
      
      return response.status(200).json({ success: true, id: beat.id });
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
    // On renvoie un JSON valide même en cas d'erreur 500 pour que le front puisse l'afficher
    return response.status(500).json({ 
        error: 'Erreur serveur base de données', 
        details: error.message 
    });
  }
}
