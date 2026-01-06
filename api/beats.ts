
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // On utilise l'URL hardcodée pour garantir la connexion
  const sql = neon(DB_URL);

  // Headers anti-cache pour garantir que l'utilisateur voit les dernières modifs
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  try {
    if (request.method === 'GET') {
      const { limit } = request.query;
      let rows;
      
      if (limit && !isNaN(Number(limit))) {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC LIMIT ${Number(limit)}`;
      } else {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC`;
      }
      
      // On transforme les lignes SQL en objets que le site comprend
      const enrichedBeats = rows.map((row) => {
        return {
          id: row.id.toString(),
          // On utilise les colonnes que vous avez confirmées comme remplies
          title: row.title || "Sans titre",
          bpm: row.bpm ? Number(row.bpm) : null,
          coverUrl: row.cover_url || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
          audioUrl: row.mp3_url || "",
          mp3Url: row.mp3_url || "",
          wavUrl: row.wav_url || "",
          stemsUrl: row.stems_url || "",
          youtubeId: row.youtube_id || "",
          date: row.date || row.created_at || new Date().toISOString(),
          // On prépare les licences en lisant les colonnes de prix SQL
          licenses: [
            {
              id: 'mp3',
              name: 'MP3 Lease',
              price: Number(row.price_mp3) || 29.99,
              fileType: 'MP3',
              features: ['MP3 Untagged', '500,000 Streams']
            },
            {
              id: 'wav',
              name: 'WAV Lease',
              price: Number(row.price_wav) || 49.99,
              fileType: 'WAV',
              features: ['WAV Untagged', 'Unlimited Streams']
            },
            {
              id: 'trackout',
              name: 'Trackout Lease',
              price: Number(row.price_trackout) || 99.99,
              fileType: 'TRACKOUT',
              features: ['All Stems (WAV)', 'Unlimited Streams']
            },
            {
              id: 'exclusive',
              name: 'Exclusive Rights',
              price: Number(row.price_exclusive) || 499.99,
              fileType: 'EXCLUSIVE',
              features: ['Full Ownership', 'Publishing 50/50']
            }
          ],
          tags: row.tags ? (Array.isArray(row.tags) ? row.tags : (typeof row.tags === 'string' ? row.tags.replace(/^{|}$/g, '').split(',') : [])) : []
        };
      });

      return response.status(200).json(enrichedBeats);
    }

    // Gestion du POST (Version complète pour que l'admin fonctionne et écrive dans les colonnes SQL)
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
      const tags = Array.isArray(beat.tags) ? beat.tags : [];
      
      // Récupération des prix depuis l'objet ou les licences
      const pMp3 = beat.price_mp3 || (beat.licenses?.find((l:any)=>l.id==='mp3')?.price) || 29.99;
      const pWav = beat.price_wav || (beat.licenses?.find((l:any)=>l.id==='wav')?.price) || 49.99;
      const pTrackout = beat.price_trackout || (beat.licenses?.find((l:any)=>l.id==='trackout')?.price) || 99.99;
      const pExclu = beat.price_exclusive || (beat.licenses?.find((l:any)=>l.id==='exclusive')?.price) || 499.99;

      await sql`
        INSERT INTO beats (
            id, title, bpm, cover_url, mp3_url, wav_url, stems_url, youtube_id, tags,
            price_mp3, price_wav, price_trackout, price_exclusive, 
            created_at
        ) VALUES (
            ${beat.id}, ${title}, ${bpm}, ${coverUrl}, ${mp3Url}, ${wavUrl}, ${stemsUrl}, ${youtubeId}, ${tags},
            ${pMp3}, ${pWav}, ${pTrackout}, ${pExclu},
            NOW()
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
            price_exclusive = EXCLUDED.price_exclusive;
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

  } catch (error: any) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Erreur de lecture', details: error.message });
  }
}
