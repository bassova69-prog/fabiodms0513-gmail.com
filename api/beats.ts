
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
    // Création automatique de la table si elle n'existe pas
    await sql`CREATE TABLE IF NOT EXISTS beats (
      id TEXT PRIMARY KEY,
      data JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );`;

    if (request.method === 'GET') {
      // On récupère aussi created_at pour servir de fallback si beat.date est vide
      const beats = await sql`SELECT data, created_at FROM beats ORDER BY created_at ASC;`;
      
      const enrichedBeats = beats.map((row) => {
        const beatData = row.data;
        // Si le champ date n'existe pas dans le JSON, on utilise created_at de la base
        if (!beatData.date && row.created_at) {
          beatData.date = row.created_at;
        }
        return beatData;
      });

      return response.status(200).json(enrichedBeats);
    }

    if (request.method === 'POST') {
      const beat = request.body;
      
      // Validation minimale
      if (!beat) {
        return response.status(400).json({ error: 'Données invalides' });
      }

      // GÉNÉRATION ID AUTOMATIQUE si manquant
      if (!beat.id) {
        beat.id = randomUUID();
      }

      // AJOUT DE LA DATE si manquante dans l'objet JSON
      if (!beat.date) {
        beat.date = new Date().toISOString();
      }

      await sql`
        INSERT INTO beats (id, data, created_at)
        VALUES (${beat.id}, ${JSON.stringify(beat)}, NOW())
        ON CONFLICT (id) DO UPDATE
        SET data = ${JSON.stringify(beat)};
      `;
      
      return response.status(200).json({ success: true, id: beat.id });
    }

    if (request.method === 'DELETE') {
      const { id } = request.query;
      
      if (!id || Array.isArray(id)) {
        return response.status(400).json({ error: 'ID manquant' });
      }
      
      await sql`DELETE FROM beats WHERE id = ${id.toString()}`;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Erreur serveur base de données', details: error.message });
  }
}
