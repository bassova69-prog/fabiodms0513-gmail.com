
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = neon(DB_URL);
  res.setHeader('Cache-Control', 'no-store');

  try {
    // 1. Lister toutes les tables publiques pour vérifier où on est connecté
    const allTables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `;

    // 2. Vérifier spécifiquement la table 'beats'
    const tableCheck = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'beats';
    `;

    // 3. Essayer de lire des données si la table existe
    let rows: any[] = [];
    let countResult: any[] = [];
    let message = "";
    
    if (tableCheck.length === 0) {
        message = "CRITICAL: La table 'beats' n'existe pas dans cette base de données.";
    } else {
        rows = await sql`SELECT * FROM beats LIMIT 5`;
        countResult = await sql`SELECT COUNT(*) FROM beats`;
        message = "Table 'beats' trouvée.";
    }

    return res.json({
      status: "Debug Report",
      database_url_masked: DB_URL.replace(/:[^:]*@/, ':***@'), // Masquer le mot de passe pour la sécurité
      tables_in_database: allTables.map(t => t.table_name),
      beats_table_exists: tableCheck.length > 0,
      beats_row_count: countResult.length > 0 ? countResult[0].count : "N/A",
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
