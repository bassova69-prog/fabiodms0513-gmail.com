
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
      
      // MODIFICATION ICI : On exécute la requête directement. 
      // Si elle échoue (table introuvable, auth incorrecte), l'erreur sera attrapée par le catch global 
      // et renvoyée au frontend avec un code 500, au lieu de renvoyer [] silencieusement.
      let rows;
      if (limit) {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC LIMIT ${Number(limit)}`;
      } else {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC`;
      }

      const beats = rows.map((row) => {
        // Parsing data JSONB si nécessaire
        let d = row.data || {};
        if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e) {} }

        const find = (keys: string[], fallback: any = "") => {
             for (const k of keys) {
                 if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
                 if (d[k] !== undefined && d[k] !== null && d[k] !== "") return d[k];
             }
             return fallback;
        };

        const id = String(row.id);
        const title = find(['title', 'name'], "Sans titre");
        const bpm = Number(find(['bpm'], 0));
        const coverUrl = find(['cover_url', 'coverUrl', 'image'], "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04");
        
        const mp3Url = find(['mp3_url', 'audio_url', 'mp3Url', 'audioUrl']);
        const wavUrl = find(['wav_url', 'wavUrl']);
        const stemsUrl = find(['stems_url', 'stemsUrl']);
        const youtubeId = find(['youtube_id', 'youtubeId']);

        let tags: string[] = [];
        const rawTags = row.tags || d.tags;
        if (Array.isArray(rawTags)) {
            tags = rawTags;
        } else if (typeof rawTags === 'string') {
            tags = rawTags.replace(/^\{|\}$/g, '').split(',').map(t => t.trim().replace(/"/g, '')).filter(Boolean);
        }

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
    
    return response.status(405).json({ error: "Method Not Allowed" });

  } catch (error: any) {
    console.error('API Error:', error);
    // On renvoie l'erreur exacte SQL pour le débogage
    return response.status(500).json({ error: error.message, code: error.code, detail: "Erreur lors de la requête SQL NeonDB" });
  }
}
