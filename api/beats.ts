
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const sql = neon(DB_URL);

  // Headers pour éviter que le navigateur ne garde les anciennes versions en mémoire
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  try {
    if (request.method === 'GET') {
      const { limit } = request.query;
      let rows;
      
      // Récupération des beats triés par date
      if (limit && !isNaN(Number(limit))) {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC LIMIT ${Number(limit)}`;
      } else {
        rows = await sql`SELECT * FROM beats ORDER BY created_at DESC`;
      }
      
      // TRANSFORMATION CRITIQUE : SQL (snake_case) -> Frontend (camelCase)
      const enrichedBeats = rows.map((row) => {
        // Fallback : on regarde aussi dans la colonne JSON 'data' si elle existe (pour les vieux beats)
        const d = row.data || {};

        // 1. Image et Titre
        const coverUrl = row.cover_url || d.coverUrl || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04";
        const title = row.title || d.title || "Sans titre";
        
        // 2. Prix (On priorise les colonnes SQL, sinon on cherche dans le JSON, sinon valeur par défaut)
        const pMp3 = Number(row.price_mp3) || d.price_mp3 || 29.99;
        const pWav = Number(row.price_wav) || d.price_wav || 49.99;
        const pTrackout = Number(row.price_trackout) || d.price_trackout || 99.99;
        const pExclu = Number(row.price_exclusive) || d.price_exclusive || 499.99;

        // 3. Tags (Gestion string vs array)
        let tags = [];
        if (Array.isArray(row.tags)) tags = row.tags;
        else if (typeof row.tags === 'string') tags = row.tags.replace(/^{|}$/g, '').split(',');
        else if (d.tags) tags = Array.isArray(d.tags) ? d.tags : [];

        // 4. Construction de l'objet Beat final
        return {
          id: row.id.toString(),
          title: title,
          bpm: Number(row.bpm) || Number(d.bpm) || 0,
          coverUrl: coverUrl,
          audioUrl: row.mp3_url || d.mp3Url || "", // Pour le lecteur audio
          mp3Url: row.mp3_url || d.mp3Url || "",
          wavUrl: row.wav_url || d.wavUrl || "",
          stemsUrl: row.stems_url || d.stemsUrl || "",
          youtubeId: row.youtube_id || d.youtubeId || "",
          date: row.created_at || d.date || new Date().toISOString(),
          tags: tags,
          // Reconstruction des licences pour que le bouton "Acheter" fonctionne
          licenses: [
            {
              id: 'mp3',
              name: 'MP3 Lease',
              price: pMp3,
              fileType: 'MP3',
              features: ['MP3 Untagged', '500,000 Streams']
            },
            {
              id: 'wav',
              name: 'WAV Lease',
              price: pWav,
              fileType: 'WAV',
              features: ['WAV Untagged', 'Unlimited Streams']
            },
            {
              id: 'trackout',
              name: 'Trackout Lease',
              price: pTrackout,
              fileType: 'TRACKOUT',
              features: ['All Stems (WAV)', 'Unlimited Streams']
            },
            {
              id: 'exclusive',
              name: 'Exclusive Rights',
              price: pExclu,
              fileType: 'EXCLUSIVE',
              features: ['Full Ownership', 'Publishing 50/50']
            }
          ]
        };
      });

      return response.status(200).json(enrichedBeats);
    }

    // Gestion de l'upload (POST) - Reste identique pour assurer l'écriture
    if (request.method === 'POST') {
      const body = request.body;
      if (!body) return response.status(400).json({ error: 'Body invalide' });
      
      let beat = body.beat || body.data || body;
      if (!beat.id) beat.id = `beat-${Date.now()}`;
      
      const title = beat.title || "Sans titre";
      const bpm = beat.bpm ? Number(beat.bpm) : 0;
      const coverUrl = beat.coverUrl || "";
      const mp3Url = beat.mp3Url || "";
      const wavUrl = beat.wavUrl || "";
      const stemsUrl = beat.stemsUrl || "";
      const youtubeId = beat.youtubeId || "";
      const tags = Array.isArray(beat.tags) ? beat.tags : [];
      
      // Extraction des prix pour sauvegarde SQL
      const pMp3 = beat.price_mp3 || (beat.licenses?.find((l:any)=>l.id==='mp3')?.price) || 29.99;
      const pWav = beat.price_wav || (beat.licenses?.find((l:any)=>l.id==='wav')?.price) || 49.99;
      const pTrackout = beat.price_trackout || (beat.licenses?.find((l:any)=>l.id==='trackout')?.price) || 99.99;
      const pExclu = beat.price_exclusive || (beat.licenses?.find((l:any)=>l.id==='exclusive')?.price) || 499.99;

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
