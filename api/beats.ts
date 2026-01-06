
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
        const limitNum = Number(limit);
        rows = await sql`SELECT * FROM beats LIMIT ${limitNum}`;
      } else {
        rows = await sql`SELECT * FROM beats`;
      }
      
      const enrichedBeats = rows.map((row) => {
        try {
            // 1. Récupération et nettoyage des données JSONB (fallback)
            let beatData = row.data;
            
            // Protection contre le JSON retourné sous forme de string
            if (typeof beatData === 'string') {
                try { beatData = JSON.parse(beatData); } catch (e) { beatData = {}; }
            }
            if (!beatData || typeof beatData !== 'object') {
                beatData = {};
            }

            // Déballage des structures imbriquées (legacy ou import externe)
            if (beatData.data && typeof beatData.data === 'object') {
                beatData = { ...beatData, ...beatData.data };
            }
            if (beatData.beat && typeof beatData.beat === 'object') {
                beatData = { ...beatData, ...beatData.beat };
            }
            
            // 2. Initialisation de l'objet Beat
            const beat: any = {
                id: row.id,
                ...beatData
            };

            // 3. FUSION : Les colonnes explicites de la DB sont prioritaires
            // On vérifie !== null et !== undefined pour ne pas écraser avec du vide si le JSON était bon
            if (row.title !== null && row.title !== undefined) beat.title = row.title;
            if (row.bpm !== null) beat.bpm = Number(row.bpm);
            if (row.cover_url) beat.coverUrl = row.cover_url;
            if (row.audio_url) beat.audioUrl = row.audio_url;
            if (row.mp3_url) beat.mp3Url = row.mp3_url;
            if (row.wav_url) beat.wavUrl = row.wav_url;
            if (row.stems_url) beat.stemsUrl = row.stems_url;
            if (row.youtube_id) beat.youtubeId = row.youtube_id;
            
            // Gestion de la date (Priorité: colonne date > colonne created_at > JSON > ID)
            if (row.date) {
                beat.date = row.date;
            } else if (row.created_at) {
                beat.date = new Date(row.created_at).toISOString();
            }

            // Gestion des tags (Text array Postgres -> JS Array)
            if (row.tags) {
                if (Array.isArray(row.tags)) beat.tags = row.tags;
                else if (typeof row.tags === 'string') beat.tags = row.tags.split(',').map((t: string) => t.trim());
            }

            // 4. Construction des Licences à partir des colonnes de prix
            // On initialise le tableau s'il n'existe pas ou on le complète
            let licenses = Array.isArray(beat.licenses) ? beat.licenses : [];

            const addOrUpdateLicense = (type: string, priceVal: any, name: string, features: string[]) => {
                const price = Number(priceVal);
                if (!isNaN(price) && price > 0) {
                    const existingIndex = licenses.findIndex((l: any) => l.fileType === type);
                    if (existingIndex >= 0) {
                        licenses[existingIndex].price = price;
                    } else {
                        licenses.push({
                            id: type.toLowerCase(),
                            name,
                            price,
                            fileType: type,
                            features,
                            streamsLimit: type === 'EXCLUSIVE' || type === 'TRACKOUT' || type === 'WAV' ? 'Unlimited' : 500000
                        });
                    }
                }
            };

            // Mapping des prix (price_lease est utilisé comme fallback pour MP3)
            const mp3Price = row.price_mp3 !== null ? row.price_mp3 : row.price_lease;
            addOrUpdateLicense('MP3', mp3Price, 'MP3 Lease', ['MP3 Untagged', '500,000 Streams']);
            addOrUpdateLicense('WAV', row.price_wav, 'WAV Lease', ['WAV Untagged', 'Unlimited Streams']);
            addOrUpdateLicense('TRACKOUT', row.price_trackout, 'Trackout Lease', ['All Stems (WAV)', 'Unlimited Streams']);
            addOrUpdateLicense('EXCLUSIVE', row.price_exclusive, 'Exclusive Rights', ['Full Ownership', 'Publishing 50/50']);

            beat.licenses = licenses;

            // 5. Valeurs par défaut ultimes pour garantir l'affichage
            if (!beat.title) beat.title = "Beat " + (row.id ? row.id.substring(row.id.length - 4) : "Inconnu");
            if (!beat.coverUrl) beat.coverUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80";
            if (!beat.tags) beat.tags = [];

            // Fallback licences si toujours vide
            if (beat.licenses.length === 0) {
                 beat.licenses = [
                    { id: 'mp3', name: 'MP3 Lease', price: 29.99, fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000 },
                 ];
            }

            // Fallback Date si toujours vide
            if (!beat.date) beat.date = new Date().toISOString();

            return beat;
        } catch (e) {
            console.error("Erreur parsing row:", e, row);
            // Retourne un objet minimal fonctionnel en cas de crash parsing
            return { 
                id: row.id || 'unknown', 
                title: "Erreur Données", 
                date: new Date().toISOString(),
                coverUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80",
                licenses: [] 
            };
        }
      }).filter(Boolean);

      // Tri par date décroissante
      enrichedBeats.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      });

      return response.status(200).json(enrichedBeats);
    }

    if (request.method === 'POST') {
      const body = request.body;
      if (!body) return response.status(400).json({ error: 'Body invalide' });
      let beat = body.beat || body.data || body;
      
      if (!beat.id) beat.id = `beat-${Date.now()}`;
      const beatId = beat.id;
      const beatJson = JSON.stringify(beat);

      // Note: Pour l'instant on continue d'écrire dans la colonne 'data' JSONB.
      // Une évolution future pourrait mapper les champs du body vers les colonnes individuelles.
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
