
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const sql = neon(DB_URL);

  try {
    await sql`CREATE TABLE IF NOT EXISTS beats (
      id TEXT PRIMARY KEY,
      data JSONB
    );`;

    if (request.method === 'GET') {
      const { limit } = request.query;
      
      let rows;
      if (limit && !isNaN(Number(limit))) {
        rows = await sql`SELECT * FROM beats LIMIT ${Number(limit)}`;
      } else {
        rows = await sql`SELECT * FROM beats`;
      }
      
      const enrichedBeats = rows.map((row) => {
        try {
            // DÉTECTION DU TITRE (Uniquement via colonnes SQL)
            const detectedTitle = row.title || row.name || row.nom || row.titre || "Sans titre";

            // DÉTECTION DE LA COVER (Uniquement via colonnes SQL)
            const detectedCover = row.cover_url || row.cover || row.image || row.image_url || 
                                  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80";

            // On crée l'objet beat
            const beat: any = {
                id: row.id,
                title: detectedTitle,
                bpm: row.bpm ? Number(row.bpm) : null,
                coverUrl: detectedCover,
                date: row.date || (row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()),
                
                // URLs Audio (Uniquement via colonnes SQL)
                mp3Url: row.mp3_url || null,
                wavUrl: row.wav_url || null,
                stemsUrl: row.stems_url || null,
                youtubeId: row.youtube_id || null
            };

            // Gestion des tags
            let rawTags = row.tags;
            if (rawTags) {
                if (Array.isArray(rawTags)) {
                    beat.tags = rawTags;
                } else if (typeof rawTags === 'string') {
                    beat.tags = rawTags.split(',').map((t: string) => t.trim());
                } else {
                    beat.tags = [];
                }
            } else {
                beat.tags = [];
            }

            // Reconstruction des licences (Colonnes SQL uniquement)
            const licenses = [];
            
            // MP3
            const pMp3 = row.price_mp3 || row.price_lease || row.mp3_price;
            if (pMp3) {
                licenses.push({
                    id: 'mp3',
                    name: 'MP3 Lease',
                    price: Number(pMp3),
                    fileType: 'MP3',
                    features: ['MP3 Untagged', '500,000 Streams'],
                    streamsLimit: 500000
                });
            }

            // WAV
            const pWav = row.price_wav || row.wav_price;
            if (pWav) {
                licenses.push({
                    id: 'wav',
                    name: 'WAV Lease',
                    price: Number(pWav),
                    fileType: 'WAV',
                    features: ['WAV Untagged', 'Unlimited Streams'],
                    streamsLimit: 'Unlimited'
                });
            }

            // TRACKOUT
            const pTrackout = row.price_trackout || row.trackout_price;
            if (pTrackout) {
                licenses.push({
                    id: 'trackout',
                    name: 'Trackout Lease',
                    price: Number(pTrackout),
                    fileType: 'TRACKOUT',
                    features: ['All Stems (WAV)', 'Unlimited Streams'],
                    streamsLimit: 'Unlimited'
                });
            }

            // EXCLUSIVE
            const pExclu = row.price_exclusive || row.exclusive_price;
            if (pExclu) {
                licenses.push({
                    id: 'exclusive',
                    name: 'Exclusive Rights',
                    price: Number(pExclu),
                    fileType: 'EXCLUSIVE',
                    features: ['Full Ownership', 'Publishing 50/50'],
                    streamsLimit: 'Unlimited'
                });
            }

            // Fallback ultime si aucune licence trouvée (pour affichage propre)
            if (licenses.length === 0) {
                 licenses.push({
                    id: 'mp3',
                    name: 'MP3 Lease',
                    price: 29.99,
                    fileType: 'MP3',
                    features: ['MP3 Untagged', '500,000 Streams'],
                    streamsLimit: 500000
                 });
            }
            
            beat.licenses = licenses;

            return beat;
        } catch (e) {
            console.error("Erreur mapping row:", e);
            return null;
        }
      }).filter(Boolean);

      enrichedBeats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return response.status(200).json(enrichedBeats);
    }

    if (request.method === 'POST') {
      const body = request.body;
      if (!body) return response.status(400).json({ error: 'Body invalide' });
      
      let beat = body.beat || body.data || body;
      
      if (!beat.id) beat.id = `beat-${Date.now()}`;
      const beatId = beat.id;
      
      const beatJson = JSON.stringify(beat);

      await sql`
        INSERT INTO beats (id, data) VALUES (${beatId}, ${beatJson}::jsonb)
        ON CONFLICT (id) DO UPDATE SET data = beats.data || ${beatJson}::jsonb;
      `;
      return response.status(200).json({ success: true, id: beatId });
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
