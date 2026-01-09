
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const sql = neon(DB_URL);
  
  // Headers pour éviter le cache et autoriser CORS
  response.setHeader('Cache-Control', 'no-store, no-cache');
  response.setHeader('Access-Control-Allow-Origin', '*');

  try {
    if (request.method === 'GET') {
      // Récupère la dernière promotion active
      // On suppose que la table contient les colonnes: is_active, message, discount_percentage, type, scope, target_beat_ids, bulk_threshold
      // Si la table n'a pas de colonne date, on prend juste la première trouvée.
      const rows = await sql`
        SELECT * FROM store_promotions 
        WHERE is_active = true 
        LIMIT 1
      `;

      if (rows.length > 0) {
        const row = rows[0];
        
        // Gestion sécurisée des IDs (format JSON ou Array PG)
        let targetIds = row.target_beat_ids;
        if (typeof targetIds === 'string') {
            try { targetIds = JSON.parse(targetIds); } catch(e) {}
        }

        const promo = {
            isActive: row.is_active,
            message: row.message,
            discountPercentage: row.discount_percentage,
            type: row.type || 'PERCENTAGE',
            scope: row.scope || 'GLOBAL',
            targetBeatIds: Array.isArray(targetIds) ? targetIds : [],
            bulkThreshold: row.bulk_threshold
        };
        return response.status(200).json(promo);
      } else {
        return response.status(200).json(null);
      }
    }
    return response.status(405).json({ error: 'Method Not Allowed' });
  } catch (error: any) {
    console.error("Erreur API Promotions:", error);
    // En cas d'erreur (ex: table inexistante), on renvoie null pour ne pas casser le front
    return response.status(500).json({ error: error.message });
  }
}
