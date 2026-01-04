
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      data JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );`;

    if (request.method === 'GET') {
      const { rows } = await sql`SELECT data FROM transactions ORDER BY created_at DESC;`;
      return response.status(200).json(rows.map(r => r.data));
    }

    if (request.method === 'POST') {
      const item = request.body;
      if (!item.id) return response.status(400).json({ error: 'ID manquant' });
      
      await sql`
        INSERT INTO transactions (id, data, created_at) VALUES (${item.id}, ${JSON.stringify(item)}, NOW())
        ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(item)};
      `;
      return response.status(200).json({ success: true });
    }

    if (request.method === 'DELETE') {
      const { id } = request.query;
      await sql`DELETE FROM transactions WHERE id = ${id as string}`;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return response.status(500).json({ error: String(error) });
  }
}
