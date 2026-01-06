
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
      
      const enrichedBeats = rows.map((rawRow) => {
        try {
            // 1. Normalisation des clés (tout en minuscule)
            const row: any = {};
            Object.keys(rawRow).forEach(k => {
                row[k.toLowerCase()] = rawRow[k];
            });

            // 2. Base JSON (si existe)
            let beatData = row.data;
            if (typeof beatData === 'string') {
                try { beatData = JSON.parse(beatData); } catch (e) { beatData = {}; }
            }
            if (!beatData || typeof beatData !== 'object') beatData = {};
            
            // Aplatissement
            if (beatData.data) beatData = { ...beatData, ...beatData.data };
            if (beatData.beat) beatData = { ...beatData, ...beatData.beat };

            const beat: any = {
                id: row.id,
                ...beatData
            };

            // 3. MAPPING "INTELLIGENT" (Alias multiples)
            
            // Titre : cherche 'title', 'name', 'nom', 'track_title'
            const titleVal = row.title || row.name || row.nom || row.track_title || row.titre;
            if (titleVal) beat.title = titleVal;

            // Cover : cherche 'cover_url', 'cover', 'image', 'img', 'artwork'
            const coverVal = row.cover_url || row.cover || row.image || row.image_url || row.img || row.artwork;
            if (coverVal) beat.coverUrl = coverVal;

            // BPM
            if (row.bpm) beat.bpm = Number(row.bpm);
            
            // URLs Audio
            if (row.audio_url) beat.audioUrl = row.audio_url;
            if (row.mp3_url) beat.mp3Url = row.mp3_url;
            if (row.wav_url) beat.wavUrl = row.wav_url;
            if (row.stems_url) beat.stemsUrl = row.stems_url;
            
            // Date
            if (row.date) beat.date = row.date;
            else if (row.created_at) beat.date = new Date(row.created_at).toISOString();

            // Tags
            const tagVal = row.tags || row.tag || row.genre || row.style;
            if (tagVal) {
                if (Array.isArray(tagVal)) beat.tags = tagVal;
                else if (typeof tagVal === 'string') {
                    const cleaned = tagVal.replace(/[{}"\[\]]/g, '');
                    beat.tags = cleaned.split(',').map((t: string) => t.trim()).filter(Boolean);
                }
            }

            // 4. LICENCES & PRIX (Alias multiples)
            const licenses = [];

            // Helper pour créer une licence
            const addLic = (type: string, name: string, priceVal: any, feats: string[]) => {
                const p = Number(priceVal);
                if (!isNaN(p) && p > 0) {
                    licenses.push({
                        id: type.toLowerCase(),
                        name,
                        price: p,
                        fileType: type,
                        features: feats,
                        streamsLimit: (type === 'EXCLUSIVE' || type === 'TRACKOUT' || type === 'WAV') ? 'Unlimited' : 500000
                    });
                }
            };

            // Détection des prix dans toutes les colonnes possibles
            const mp3 = row.price_mp3 || row.price_lease || row.mp3_price || row.lease_price || row.price || row.prix || row.montant;
            const wav = row.price_wav || row.wav_price || row.price_premium;
            const trackout = row.price_trackout || row.trackout_price || row.stems_price;
            const exclusive = row.price_exclusive || row.exclusive_price;

            addLic('MP3', 'MP3 Lease', mp3, ['MP3 Untagged', '500,000 Streams']);
            addLic('WAV', 'WAV Lease', wav, ['WAV Untagged', 'Unlimited Streams']);
            addLic('TRACKOUT', 'Trackout Lease', trackout, ['All Stems (WAV)', 'Unlimited Streams']);
            addLic('EXCLUSIVE', 'Exclusive Rights', exclusive, ['Full Ownership', 'Publishing 50/50']);

            // Si on a trouvé des prix, on les utilise
            if (licenses.length > 0) {
                beat.licenses = licenses;
            } else if (!beat.licenses || beat.licenses.length === 0) {
                // Si AUCUN prix trouvé, on met un prix par défaut pour éviter la carte vide
                beat.licenses = [
                    { id: 'mp3', name: 'MP3 Lease', price: 29.99, fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000 }
                ];
            }

            // 5. SECURITE AFFICHAGE
            if (!beat.title || beat.title === "Sans titre") beat.title = "Beat " + (beat.id ? beat.id.slice(0, 5) : "Unknown");
            if (!beat.coverUrl) beat.coverUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80";
            if (!beat.tags) beat.tags = [];
            if (!beat.date) beat.date = new Date().toISOString();

            return beat;
        } catch (e) {
            console.error("Erreur parsing beat:", e);
            // On renvoie null pour que le filter(Boolean) le retire proprement
            return null;
        }
      }).filter(Boolean);

      // Tri par date
      enrichedBeats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return response.status(200).json(enrichedBeats);
    }

    // --- POST & DELETE inchangés ---
    if (request.method === 'POST') {
      const body = request.body;
      let beat = body.beat || body.data || body;
      if (!beat.id) beat.id = `beat-${Date.now()}`;
      
      const beatJson = JSON.stringify(beat);
      await sql`
        INSERT INTO beats (id, data) VALUES (${beat.id}, ${beatJson}::jsonb)
        ON CONFLICT (id) DO UPDATE SET data = beats.data || ${beatJson}::jsonb;
      `;
      return response.status(200).json({ success: true, id: beat.id });
    }

    if (request.method === 'DELETE') {
      const { id } = request.query;
      const idVal = Array.isArray(id) ? id[0] : id;
      await sql`DELETE FROM beats WHERE id = ${idVal}`;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Erreur DB', details: error.message });
  }
}
