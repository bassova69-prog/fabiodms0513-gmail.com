
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

// Fonction utilitaire pour parser les dates (ISO ou FR DD/MM/YYYY) côté serveur
const parseDate = (dateStr: any): number => {
    if (!dateStr) return 0;
    
    // Essai format standard/ISO
    const ts = new Date(dateStr).getTime();
    if (!isNaN(ts)) return ts;
    
    // Essai format français DD/MM/YYYY (souvent utilisé dans l'app)
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            // Conversion en YYYY-MM-DD pour que Node comprenne
            const isoLike = `${parts[2]}-${parts[1]}-${parts[0]}`;
            const tsFr = new Date(isoLike).getTime();
            if (!isNaN(tsFr)) return tsFr;
        }
    }
    return 0;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const sql = neon(DB_URL);

  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      data JSONB
    );`;
    
    if (request.method === 'GET') {
      const rows = await sql`SELECT data FROM transactions`;
      
      const data = rows.map(r => r.data || {}).sort((a: any, b: any) => 
        parseDate(b.date) - parseDate(a.date)
      );
      
      return response.status(200).json(data);
    }

    if (request.method === 'POST') {
      const item = request.body;
      if (!item || !item.id) return response.status(400).json({ error: 'ID manquant' });
      
      const json = JSON.stringify(item);
      await sql`
        INSERT INTO transactions (id, data) VALUES (${item.id}, ${json}::jsonb)
        ON CONFLICT (id) DO UPDATE SET data = ${json}::jsonb;
      `;
      return response.status(200).json({ success: true });
    }

    if (request.method === 'DELETE') {
      const { id } = request.query;
      const idVal = Array.isArray(id) ? id[0] : id;
      if (!idVal) return response.status(400).json({ error: 'ID manquant' });

      await sql`DELETE FROM transactions WHERE id = ${idVal}`;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error("Transaction API Error:", error);
    return response.status(500).json({ error: error.message });
  }
}
