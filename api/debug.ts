
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const sql = neon(DB_URL);
  res.setHeader('Cache-Control', 'no-store');

  try {
    // 1. Infos de connexion (Endpoint)
    // Utile pour vérifier si on est sur le bon projet Neon
    const endpointID = DB_URL.match(/@([^.]+)/)?.[1] || "inconnu";

    // 2. Vérifier la table 'beats' et ses colonnes EXACTES
    const columnsCheck = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'beats';
    `;

    // 3. Chercher SPÉCIFIQUEMENT l'ID mentionné
    // On utilise une recherche large (texte) pour voir si on le trouve
    let specificBeat = [];
    try {
        specificBeat = await sql`SELECT * FROM beats WHERE id::text LIKE '%beat-1767791982327%' LIMIT 1`;
    } catch(e) {
        console.error("Search failed", e);
    }

    // 4. Compter total
    let countResult: any[] = [];
    if (columnsCheck.length > 0) {
        countResult = await sql`SELECT COUNT(*) FROM beats`;
    }

    return res.json({
      status: "Debug Report v2",
      connected_to_endpoint: endpointID,
      target_id_search: "beat-1767791982327",
      found_target: specificBeat.length > 0 ? "OUI - TROUVÉ !" : "NON - PAS TROUVÉ",
      target_data: specificBeat[0] || null,
      table_structure: columnsCheck.map(c => `${c.column_name} (${c.data_type})`),
      total_rows: countResult.length > 0 ? countResult[0].count : 0,
      database_url_masked: DB_URL.replace(/:[^:]*@/, ':***@'),
    });

  } catch (e: any) {
    return res.status(500).json({ 
        error: "Connection Failed", 
        message: e.message, 
        code: e.code 
    });
  }
}
