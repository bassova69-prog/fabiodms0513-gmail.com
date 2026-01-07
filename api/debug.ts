
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = neon(DB_URL);
  res.setHeader('Cache-Control', 'no-store');

  try {
    // 1. Lister toutes les tables
    const allTables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `;

    // 2. Vérifier la table 'beats' et ses colonnes
    const columnsCheck = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'beats';
    `;

    // 3. Essayer de lire des données
    let rows: any[] = [];
    let countResult: any[] = [];
    let message = "";
    
    if (columnsCheck.length === 0) {
        message = "CRITICAL: La table 'beats' n'existe pas.";
    } else {
        rows = await sql`SELECT * FROM beats LIMIT 3`;
        countResult = await sql`SELECT COUNT(*) FROM beats`;
        message = "Table 'beats' trouvée.";
    }

    return res.json({
      status: "Debug Report",
      database_url_masked: DB_URL.replace(/:[^:]*@/, ':***@'),
      tables: allTables.map(t => t.table_name),
      beats_columns: columnsCheck.map(c => `${c.column_name} (${c.data_type})`),
      beats_count: countResult.length > 0 ? countResult[0].count : 0,
      sample_data: rows,
      message
    });

  } catch (e: any) {
    return res.status(500).json({ 
        error: "Connection Failed", 
        message: e.message, 
        code: e.code 
    });
  }
}
