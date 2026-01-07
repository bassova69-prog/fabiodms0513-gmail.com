import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Cache-Control', 'no-store, no-cache');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const sql = neon(DB_URL);

    if (request.method === 'GET') {
      const { limit } = request.query;
      
      let rows;
      try {
          if (limit) {
            rows = await sql`SELECT * FROM beats ORDER BY created_at DESC LIMIT ${Number(limit)}`;
          } else {
            rows = await sql`SELECT * FROM beats ORDER BY created_at DESC`;
          }
      } catch (dbError: any) {
          console.error("SQL Error:", dbError);
          // Fallback: si la table n'existe pas ou erreur colonne, on renvoie tableau vide pour ne pas crash le front
          return response.status(200).json([]);
      }

      const beats = rows.map((row) => {
        // Parsing data JSONB si nécessaire
        let d = row.data || {};
        if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e) {} }

        const find = (keys: string[], fallback: any = "") => {
             for (const k of keys) {
                 // Check row properties
                 if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
                 // Check JSON data properties
                 if (d[k] !== undefined && d[k] !== null && d[k] !== "") return d[k];
             }
             return fallback;
        };

        // Mapping Schema Utilisateur
        const id = String(row.id);
        const title = find(['title', 'name'], "Sans titre");
        const bpm = Number(find(['bpm'], 0));
        const coverUrl = find(['cover_url', 'coverUrl', 'image'], "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04");
        
        // URLs Audio
        const mp3Url = find(['mp3_url', 'audio_url', 'mp3Url', 'audioUrl']);
        const wavUrl = find(['wav_url', 'wavUrl']);
        const stemsUrl = find(['stems_url', 'stemsUrl']);
        const youtubeId = find(['youtube_id', 'youtubeId']);

        // Gestion Tags (Postgres TEXT[] ou string "{a,b}")
        let tags: string[] = [];
        const rawTags = row.tags || d.tags;
        if (Array.isArray(rawTags)) {
            tags = rawTags;
        } else if (typeof rawTags === 'string') {
            // Nettoyage format postgres {tag1,tag2}
            tags = rawTags.replace(/^\{|\}$/g, '').split(',').map(t => t.trim().replace(/"/g, '')).filter(Boolean);
        }

        // Prix (Fallback intelligent)
        // Note: Neon retourne parfois des strings pour les types NUMERIC
        const pMp3 = Number(find(['price_mp3', 'priceMp3', 'price_lease'], 29.99));
        const pWav = Number(find(['price_wav', 'priceWav'], 49.99));
        const pTrack = Number(find(['price_trackout', 'priceTrackout'], 99.99));
        const pExclu = Number(find(['price_exclusive', 'priceExclusive'], 499.99));

        return {
            id,
            title,
            bpm,
            tags,
            cover_url: coverUrl,
            mp3_url: mp3Url,
            wav_url: wavUrl,
            stems_url: stemsUrl,
            youtube_id: youtubeId,
            audioUrl: mp3Url,
            date: find(['created_at', 'date'], new Date().toISOString()),
            licenses: [
                { id: 'mp3', name: 'MP3 Lease', price: pMp3, fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'] },
                { id: 'wav', name: 'WAV Lease', price: pWav, fileType: 'WAV', features: ['WAV Untagged', 'Unlimited Streams'] },
                { id: 'trackout', name: 'Trackout Lease', price: pTrack, fileType: 'TRACKOUT', features: ['All Stems (WAV)', 'Unlimited Streams'] },
                { id: 'exclusive', name: 'Exclusive Rights', price: pExclu, fileType: 'EXCLUSIVE', features: ['Full Ownership', 'Publishing 50/50'] }
            ]
        };
      });

      return response.status(200).json(beats);
    }
    
    // POST et DELETE conservés pour compatibilité future (admin)
    return response.status(405).json({ error: "Method Not Allowed" });

  } catch (error: any) {
    console.error('API Error:', error);
    return response.status(500).json({ error: error.message });
  }
}