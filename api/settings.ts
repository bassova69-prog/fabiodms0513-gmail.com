
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Empêcher le cache Vercel et Navigateur pour avoir les données en temps réel
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  try {
    // Table clé-valeur simple pour les configurations
    await sql`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB,
      updated_at TIMESTAMP DEFAULT NOW()
    );`;

    if (request.method === 'GET') {
      const { key } = request.query;
      if (key) {
        const { rows } = await sql`SELECT value FROM settings WHERE key = ${key as string}`;
        return response.status(200).json(rows.length > 0 ? rows[0].value : null);
      }
      return response.status(400).json({ error: 'Key required' });
    }

    if (request.method === 'POST') {
      const { key, value } = request.body;
      if (!key || value === undefined) return response.status(400).json({ error: 'Invalid data' });

      await sql`
        INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${JSON.stringify(value)}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}, updated_at = NOW();
      `;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return response.status(500).json({ error: String(error) });
  }
}
