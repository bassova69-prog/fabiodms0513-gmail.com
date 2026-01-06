
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const sql = neon(DB_URL);

  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      data JSONB
    );`;
    
    if (request.method === 'GET') {
      const rows = await sql`SELECT data FROM transactions`;
      // Tri côté JS pour sécurité
      const data = rows.map(r => r.data).sort((a: any, b: any) => 
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
      return response.status(200).json(data);
    }

    if (request.method === 'POST') {
      const item = request.body;
      if (!item.id) return response.status(400).json({ error: 'ID manquant' });
      
      await sql`
        INSERT INTO transactions (id, data) VALUES (${item.id}, ${JSON.stringify(item)})
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
  } catch (error: any) {
    return response.status(500).json({ error: error.message });
  }
}
