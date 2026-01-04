
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  try {
    // Création automatique de la table si elle n'existe pas
    await sql`CREATE TABLE IF NOT EXISTS beats (
      id TEXT PRIMARY KEY,
      data JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );`;

    if (request.method === 'GET') {
      // Récupérer les beats (du plus ancien au plus récent pour respecter la logique frontend existante qui inverse le tableau)
      const { rows } = await sql`SELECT data FROM beats ORDER BY created_at ASC;`;
      const beats = rows.map((row) => row.data);
      return response.status(200).json(beats);
    }

    if (request.method === 'POST') {
      const beat = request.body;
      
      if (!beat || !beat.id) {
        return response.status(400).json({ error: 'Données invalides : ID manquant' });
      }

      // Insertion ou Mise à jour (Upsert)
      await sql`
        INSERT INTO beats (id, data, created_at)
        VALUES (${beat.id}, ${JSON.stringify(beat)}, NOW())
        ON CONFLICT (id) DO UPDATE
        SET data = ${JSON.stringify(beat)};
      `;
      
      return response.status(200).json({ success: true });
    }

    if (request.method === 'DELETE') {
      const { id } = request.query;
      
      if (!id || Array.isArray(id)) {
        return response.status(400).json({ error: 'ID manquant' });
      }
      
      await sql`DELETE FROM beats WHERE id = ${id}`;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });

  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Erreur serveur base de données', details: String(error) });
  }
}
