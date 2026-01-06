
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
      const rows = await sql`SELECT * FROM beats`;
      
      // TEST : On envoie les données brutes telles qu'elles sortent de Neon
      return response.status(200).json(rows);
    }

    // Gestion du POST (Version complète avec écriture hybride SQL + JSON pour compatibilité max)
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
      
      // Récupération des prix
      const pMp3 = beat.price_mp3 || (beat.licenses?.find((l:any)=>l.id==='mp3')?.price) || 29.99;
      const pWav = beat.price_wav || (beat.licenses?.find((l:any)=>l.id==='wav')?.price) || 49.99;
      const pTrackout = beat.price_trackout || (beat.licenses?.find((l:any)=>l.id==='trackout')?.price) || 99.99;
      const pExclu = beat.price_exclusive || (beat.licenses?.find((l:any)=>l.id==='exclusive')?.price) || 499.99;

      // Fallback JSON complet
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

  } catch (error: any) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Erreur de lecture', details: error.message });
  }
}
