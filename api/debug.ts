
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = neon(DB_URL);
  
  // Pas de cache pour le debug
  res.setHeader('Cache-Control', 'no-store');

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Veuillez fournir un id dans l'url, ex: /api/debug?id=beat-123" });
  }

  try {
    const rows = await sql`SELECT * FROM beats WHERE id = ${id as string}`;
    
    if (rows.length === 0) {
        return res.json({ 
            found: false, 
            message: "Aucun beat trouvé avec cet ID dans la base de données Neon." 
        });
    }

    return res.json({ 
        found: true, 
        row: rows[0],
        analysis: "Voici les données brutes de la base de données pour cet ID."
    });

  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
