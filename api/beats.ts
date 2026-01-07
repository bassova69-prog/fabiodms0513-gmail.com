
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const sql = neon(DB_URL);

  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  try {
    if (request.method === 'GET') {
      const { limit } = request.query;
      let rows;
      
      try {
          if (limit && !isNaN(Number(limit))) {
            rows = await sql`SELECT * FROM beats ORDER BY created_at DESC LIMIT ${Number(limit)}`;
          } else {
            rows = await sql`SELECT * FROM beats ORDER BY created_at DESC`;
          }
      } catch (sqlError: any) {
          console.error("SQL Error:", sqlError);
          return response.status(200).json([]);
      }

      // MAPPING SIMPLIFIÉ (Snake Case Direct)
      const beats = rows.map((row) => {
        let d = row.data || {};
        if (typeof d === 'string') { try { d = JSON.parse(d); } catch(e) {} }

        // Valeurs prioritaires (Colonne SQL > JSON)
        const getVal = (col: string, jsonKey: string, fallback: any) => {
             if (row[col] !== undefined && row[col] !== null && row[col] !== "") return row[col];
             if (d[col] !== undefined && d[col] !== null && d[col] !== "") return d[col]; // check snake in json
             if (d[jsonKey] !== undefined && d[jsonKey] !== null && d[jsonKey] !== "") return d[jsonKey]; // check camel in json (legacy)
             return fallback;
        };

        const priceMp3 = Number(getVal('price_mp3', 'priceMp3', 29.99));
        const priceWav = Number(getVal('price_wav', 'priceWav', 49.99));
        const priceTrackout = Number(getVal('price_trackout', 'priceTrackout', 99.99));
        const priceExclusive = Number(getVal('price_exclusive', 'priceExclusive', 499.99));

        let tags = [];
        const rawTags = row.tags || d.tags;
        if (Array.isArray(rawTags)) tags = rawTags;
        else if (typeof rawTags === 'string') {
            tags = rawTags.replace(/^{|}$/g, '').split(',').map((t: string) => t.trim()).filter(Boolean);
        }

        const mp3Url = getVal('mp3_url', 'mp3Url', "");

        return {
            id: row.id.toString(),
            title: getVal('title', 'title', "Sans titre"),
            bpm: Number(getVal('bpm', 'bpm', 0)),
            tags: tags,
            cover_url: getVal('cover_url', 'coverUrl', "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04"),
            mp3_url: mp3Url,
            wav_url: getVal('wav_url', 'wavUrl', ""),
            stems_url: getVal('stems_url', 'stemsUrl', ""),
            youtube_id: getVal('youtube_id', 'youtubeId', ""),
            audioUrl: mp3Url, // Alias pour le player
            date: row.created_at || new Date().toISOString(),
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
      
      // On accepte les deux formats en entrée (camel ou snake) pour la robustesse, 
      // mais on sauvegarde en colonnes SQL snake_case
      const title = beat.title || "Sans titre";
      const bpm = Number(beat.bpm) || 0;
      const coverUrl = beat.cover_url || beat.coverUrl || "";
      const mp3Url = beat.mp3_url || beat.mp3Url || "";
      const wavUrl = beat.wav_url || beat.wavUrl || "";
      const stemsUrl = beat.stems_url || beat.stemsUrl || "";
      const youtubeId = beat.youtube_id || beat.youtubeId || "";
      const tags = Array.isArray(beat.tags) ? beat.tags : [];
      
      // Extraction Prix
      const getP = (keySnake: string, keyCamel: string, id: string, def: number) => {
          if (beat[keySnake]) return Number(beat[keySnake]);
          if (beat[keyCamel]) return Number(beat[keyCamel]);
          const l = beat.licenses?.find((lic: any) => lic.id === id);
          return l ? Number(l.price) : def;
      };

      const pMp3 = getP('price_mp3', 'priceMp3', 'mp3', 29.99);
      const pWav = getP('price_wav', 'priceWav', 'wav', 49.99);
      const pTrackout = getP('price_trackout', 'priceTrackout', 'trackout', 99.99);
      const pExclu = getP('price_exclusive', 'priceExclusive', 'exclusive', 499.99);

      // JSON de backup
      const beatJson = JSON.stringify({
          ...beat,
          cover_url: coverUrl, mp3_url: mp3Url, wav_url: wavUrl, stems_url: stemsUrl, youtube_id: youtubeId,
          price_mp3: pMp3, price_wav: pWav, price_trackout: pTrackout, price_exclusive: pExclu
      });

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
        await sql`DELETE FROM beats WHERE id = ${idVal}`;
        return response.status(200).json({ success: true });
    }

  } catch (error: any) {
    console.error('Database Error:', error);
    if (request.method === 'GET') return response.status(200).json([]);
    return response.status(500).json({ error: error.message });
  }
}
