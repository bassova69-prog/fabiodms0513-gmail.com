
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { randomUUID } from 'crypto';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const sql = neon(DB_URL);

  try {
    // On revient au schéma simple et stable
    await sql`CREATE TABLE IF NOT EXISTS beats (
      id TEXT PRIMARY KEY,
      data JSONB
    );`;

    if (request.method === 'GET') {
      // On ne sélectionne QUE les données JSON pour éviter toute erreur de colonne
      const beats = await sql`SELECT data FROM beats`;
      
      const enrichedBeats = beats.map((row) => {
        const beatData = row.data;
        
        // LOGIQUE DE RÉPARATION DE LA DATE (Côté Serveur)
        // Si pas de date, on essaie de l'extraire de l'ID (ex: beat-1767715149742)
        if (!beatData.date) {
            if (beatData.id && beatData.id.startsWith('beat-')) {
                const timestamp = parseInt(beatData.id.split('-')[1]);
                // Si le timestamp semble valide (supérieur à 2020)
                if (!isNaN(timestamp) && timestamp > 1600000000000) {
                    beatData.date = new Date(timestamp).toISOString();
                } else {
                    beatData.date = new Date().toISOString();
                }
            } else {
                beatData.date = new Date().toISOString();
            }
        }
        return beatData;
      });

      // Tri par date (du plus récent au plus ancien)
      enrichedBeats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return response.status(200).json(enrichedBeats);
    }

    if (request.method === 'POST') {
      const beat = request.body;
      
      if (!beat) {
        return response.status(400).json({ error: 'Données invalides' });
      }

      // Si l'ID est fourni sans prefixe ou manquant
      if (!beat.id) {
        beat.id = `beat-${Date.now()}`;
      }

      // On assure une date dans le JSON sauvegardé
      if (!beat.date) {
        beat.date = new Date().toISOString();
      }

      await sql`
        INSERT INTO beats (id, data)
        VALUES (${beat.id}, ${JSON.stringify(beat)})
        ON CONFLICT (id) DO UPDATE
        SET data = ${JSON.stringify(beat)};
      `;
      
      return response.status(200).json({ success: true, id: beat.id });
    }

    if (request.method === 'DELETE') {
      const { id } = request.query;
      if (!id) return response.status(400).json({ error: 'ID manquant' });
      
      await sql`DELETE FROM beats WHERE id = ${id.toString()}`;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Erreur serveur base de données', details: error.message });
  }
}
