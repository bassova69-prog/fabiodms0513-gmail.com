
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const sql = neon(DB_URL);
  
  // DÉSACTIVATION STRICTE DU CACHE
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  try {
    // 1. Initialisation de la table
    await sql`CREATE TABLE IF NOT EXISTS beats (id TEXT PRIMARY KEY, data JSONB)`;
    
    // 2. Migration Auto : Création des colonnes SQL si elles manquent
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS title TEXT`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS bpm INTEGER`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS cover_url TEXT`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS mp3_url TEXT`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS wav_url TEXT`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS stems_url TEXT`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS youtube_id TEXT`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS tags TEXT[]`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS price_mp3 NUMERIC`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS price_wav NUMERIC`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS price_trackout NUMERIC`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS price_exclusive NUMERIC`;
    await sql`ALTER TABLE beats ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`;

    if (request.method === 'GET') {
      const { limit } = request.query;
      
      let rows;
      if (limit && !isNaN(Number(limit))) {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC LIMIT ${Number(limit)}`;
      } else {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC`;
      }
      
      const enrichedBeats = rows.map((row) => {
        try {
            // RÉCUPÉRATION HYBRIDE : SQL (Prioritaire) > JSON (Fallback pour anciens beats)
            const d = row.data || {}; // Données JSON legacy

            const title = row.title || d.title || d.name || d.nom || d.titre || "Sans titre";
            const bpm = row.bpm ? Number(row.bpm) : (d.bpm ? Number(d.bpm) : null);
            const coverUrl = row.cover_url || d.coverUrl || d.cover || d.image || d.imageUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80";
            
            // Dates
            const dateStr = row.created_at || d.date || new Date().toISOString();
            
            // Fichiers
            const mp3Url = row.mp3_url || d.mp3Url || d.mp3_url || null;
            const wavUrl = row.wav_url || d.wavUrl || d.wav_url || null;
            const stemsUrl = row.stems_url || d.stemsUrl || d.stems_url || null;
            const youtubeId = row.youtube_id || d.youtubeId || d.youtube_id || null;

            // Gestion safe des tags
            let tags: string[] = [];
            if (row.tags && Array.isArray(row.tags) && row.tags.length > 0) {
                tags = row.tags;
            } else if (typeof row.tags === 'string') {
                tags = row.tags.replace(/^{|}$/g, '').split(',').map((s:string) => s.trim()).filter(Boolean);
            } else if (d.tags) {
                 // Fallback JSON
                 tags = Array.isArray(d.tags) ? d.tags : (typeof d.tags === 'string' ? d.tags.split(',') : []);
            }

            const beat: any = {
                id: row.id,
                title, bpm, coverUrl, date: new Date(dateStr).toISOString(),
                mp3Url, wavUrl, stemsUrl, youtubeId, tags
            };

            // Reconstruction des licences (SQL > JSON > Default)
            const licenses = [];
            
            // MP3
            const pMp3 = row.price_mp3 || d.price_mp3 || d.mp3_price || d.price_lease;
            if (pMp3) {
                licenses.push({
                    id: 'mp3', name: 'MP3 Lease', price: Number(pMp3),
                    fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000
                });
            } else {
                 // Fallback si pas de prix trouvé mais qu'on veut afficher quelque chose
                 licenses.push({
                    id: 'mp3', name: 'MP3 Lease', price: 29.99,
                    fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000
                });
            }

            // WAV
            const pWav = row.price_wav || d.price_wav || d.wav_price;
            if (pWav) {
                licenses.push({
                    id: 'wav', name: 'WAV Lease', price: Number(pWav),
                    fileType: 'WAV', features: ['WAV Untagged', 'Unlimited Streams'], streamsLimit: 'Unlimited'
                });
            }

            // TRACKOUT
            const pTrackout = row.price_trackout || d.price_trackout || d.trackout_price;
            if (pTrackout) {
                licenses.push({
                    id: 'trackout', name: 'Trackout Lease', price: Number(pTrackout),
                    fileType: 'TRACKOUT', features: ['All Stems (WAV)', 'Unlimited Streams'], streamsLimit: 'Unlimited'
                });
            }

            // EXCLUSIVE
            const pExclu = row.price_exclusive || d.price_exclusive || d.exclusive_price;
            if (pExclu) {
                licenses.push({
                    id: 'exclusive', name: 'Exclusive Rights', price: Number(pExclu),
                    fileType: 'EXCLUSIVE', features: ['Full Ownership', 'Publishing 50/50'], streamsLimit: 'Unlimited'
                });
            }
            
            beat.licenses = licenses;
            return beat;
        } catch (e) {
            console.error("Erreur mapping row:", e);
            return null;
        }
      }).filter(Boolean);

      return response.status(200).json(enrichedBeats);
    }

    if (request.method === 'POST') {
      const body = request.body;
      if (!body) return response.status(400).json({ error: 'Body invalide' });
      
      let beat = body.beat || body.data || body;
      
      if (!beat.id) beat.id = `beat-${Date.now()}`;
      
      // Préparation des valeurs pour les colonnes SQL
      const title = beat.title || "Sans titre";
      const bpm = beat.bpm ? Number(beat.bpm) : 0;
      const coverUrl = beat.coverUrl || "";
      const mp3Url = beat.mp3Url || "";
      const wavUrl = beat.wavUrl || "";
      const stemsUrl = beat.stemsUrl || "";
      const youtubeId = beat.youtubeId || "";
      // Conversion tags tableau -> format compatible
      const tags = Array.isArray(beat.tags) ? beat.tags : [];
      
      const pMp3 = beat.price_mp3 || 29.99;
      const pWav = beat.price_wav || 49.99;
      const pTrackout = beat.price_trackout || 99.99;
      const pExclu = beat.price_exclusive || 499.99;

      // On garde aussi le JSON complet en backup dans la colonne data
      const beatJson = JSON.stringify(beat);

      await sql`
        INSERT INTO beats (
            id, title, bpm, cover_url, mp3_url, wav_url, stems_url, youtube_id, tags,
            price_mp3, price_wav, price_trackout, price_exclusive, 
            data, created_at
        ) VALUES (
            ${beat.id}, ${title}, ${bpm}, ${coverUrl}, ${mp3Url}, ${wavUrl}, ${stemsUrl}, ${youtubeId}, ${tags},
            ${pMp3}, ${pWav}, ${pTrackout}, ${pExclu},
            ${beatJson}::jsonb, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            bpm = EXCLUDED.bpm,
            cover_url = EXCLUDED.cover_url,
            mp3_url = EXCLUDED.mp3_url,
            wav_url = EXCLUDED.wav_url,
            stems_url = EXCLUDED.stems_url,
            youtube_id = EXCLUDED.youtube_id,
            tags = EXCLUDED.tags,
            price_mp3 = EXCLUDED.price_mp3,
            price_wav = EXCLUDED.price_wav,
            price_trackout = EXCLUDED.price_trackout,
            price_exclusive = EXCLUDED.price_exclusive,
            data = EXCLUDED.data;
      `;
      return response.status(200).json({ success: true, id: beat.id });
    }

    if (request.method === 'DELETE') {
      const { id } = request.query;
      const idVal = Array.isArray(id) ? id[0] : id;
      if (!idVal) return response.status(400).json({ error: 'ID manquant' });
      await sql`DELETE FROM beats WHERE id = ${idVal}`;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Erreur DB', details: error.message });
  }
}
