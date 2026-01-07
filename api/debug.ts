
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = neon(DB_URL);
  res.setHeader('Cache-Control', 'no-store');

  try {
    // 1. Check if table exists
    const tableCheck = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'beats';
    `;

    // 2. Fetch raw rows
    let rows: any[] = [];
    let message = "Table 'beats' exists.";
    
    if (tableCheck.length === 0) {
        message = "CRITICAL: Table 'beats' does NOT exist.";
    } else {
        rows = await sql`SELECT * FROM beats LIMIT 5`;
    }

    return res.json({
      status: "Debug Report",
      tableExists: tableCheck.length > 0,
      message,
      rowCount: rows.length,
      sampleData: rows
    });

  } catch (e: any) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
