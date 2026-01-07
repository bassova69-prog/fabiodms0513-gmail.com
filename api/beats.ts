
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  const sql = neon(DB_URL);

  try {
    if (request.method === 'GET') {
      const { limit } = request.query;
      let rows;
      
      // Sélectionne toutes les colonnes disponibles
      if (limit && !isNaN(Number(limit))) {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC LIMIT ${Number(limit)}`;
      } else {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC`;
      }

      const beats = rows.map((row) => {
        // Tente de parser le champ JSON 'data' s'il existe (pour rétrocompatibilité)
        let d = row.data || {};
        if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e) {} }

        // Fonction utilitaire pour chercher une valeur dans plusieurs colonnes possibles
        // Ordre de priorité : Colonne DB > Champ JSON > Fallback
        const find = (keys: string[], fallback: any = "") => {
             for (const k of keys) {
                 if (row[k] !== undefined && row[k] !== null && row[k] !== "") return row[k];
                 if (d[k] !== undefined && d[k] !== null && d[k] !== "") return d[k];
             }
             return fallback;
        };

        // Mapping strict basé sur le schéma fourni par l'utilisateur
        const title = find(['title', 'name'], "Sans titre");
        const bpm = Number(find(['bpm'], 0));
        const coverUrl = find(['cover_url', 'coverUrl', 'image'], "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04");
        
        // Gestion audio : vérifie mp3_url ET audio_url
        const mp3Url = find(['mp3_url', 'audio_url', 'mp3Url', 'audioUrl']);
        const wavUrl = find(['wav_url', 'wavUrl']);
        const stemsUrl = find(['stems_url', 'stemsUrl']);
        const youtubeId = find(['youtube_id', 'youtubeId']);

        // Gestion des tags (TEXT[] ou string)
        let tags: string[] = [];
        const rawTags = row.tags || d.tags;
        if (Array.isArray(rawTags)) {
            tags = rawTags;
        } else if (typeof rawTags === 'string') {
            tags = rawTags.replace(/^{|}$/g, '').split(',').map((t: string) => t.trim()).filter(Boolean);
        }

        // Prix : Fallback sur price_lease si price_mp3 est manquant
        const priceMp3 = Number(find(['price_mp3', 'priceMp3', 'price_lease'], 29.99));
        const priceWav = Number(find(['price_wav', 'priceWav'], 49.99));
        const priceTrackout = Number(find(['price_trackout', 'priceTrackout'], 99.99));
        const priceExclusive = Number(find(['price_exclusive', 'priceExclusive'], 499.99));

        return {
            id: String(row.id),
            title,
            bpm,
            tags,
            cover_url: coverUrl,
            mp3_url: mp3Url,
            wav_url: wavUrl,
            stems_url: stemsUrl,
            youtube_id: youtubeId,
            audioUrl: mp3Url, // Alias pour le player React
            date: find(['created_at', 'date'], new Date().toISOString()),
            licenses: [
                {
                  id: 'mp3',
                  name: 'MP3 Lease',
                  price: priceMp3,
                  fileType: 'MP3',
                  features: ['MP3 Untagged', '500,000 Streams']
                },
                {
                  id: 'wav',
                  name: 'WAV Lease',
                  price: priceWav,
                  fileType: 'WAV',
                  features: ['WAV Untagged', 'Unlimited Streams']
                },
                {
                  id: 'trackout',
                  name: 'Trackout Lease',
                  price: priceTrackout,
                  fileType: 'TRACKOUT',
                  features: ['All Stems (WAV)', 'Unlimited Streams']
                },
                {
                  id: 'exclusive',
                  name: 'Exclusive Rights',
                  price: priceExclusive,
                  fileType: 'EXCLUSIVE',
                  features: ['Full Ownership', 'Publishing 50/50']
                }
            ]
        };
      });

      return response.status(200).json(beats);
    }

    if (request.method === 'POST') {
      const body = request.body;
      let beat = body.beat || body.data || body;
      
      if (!beat.id) beat.id = `beat-${Date.now()}`;
      
      // ... logique d'insertion standard, compatible avec le schéma ...
      // Pour éviter de casser l'existant, on insert dans les colonnes standard
      // Si l'utilisateur a des colonnes custom non gérées ici, elles seront ignorées (sauf si dans JSONB data)
      
      const beatJson = JSON.stringify(beat);

      await sql`
        INSERT INTO beats (
            id, title, bpm, cover_url, mp3_url, wav_url, stems_url, youtube_id, tags,
            price_mp3, price_wav, price_trackout, price_exclusive, 
            data, created_at
        ) VALUES (
            ${beat.id}, ${beat.title || "Sans Titre"}, ${Number(beat.bpm) || 0}, 
            ${beat.cover_url || beat.coverUrl}, ${beat.mp3_url || beat.mp3Url}, 
            ${beat.wav_url || beat.wavUrl}, ${beat.stems_url || beat.stemsUrl}, 
            ${beat.youtube_id || beat.youtubeId}, ${beat.tags || []},
            ${beat.price_mp3 || 29.99}, ${beat.price_wav || 49.99}, 
            ${beat.price_trackout || 99.99}, ${beat.price_exclusive || 499.99},
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
        await sql`DELETE FROM beats WHERE id = ${idVal}`;
        return response.status(200).json({ success: true });
    }

  } catch (error: any) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: error.message, details: "Erreur SQL NeonDB" });
  }
}
