
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const sql = neon(DB_URL);

  try {
    // Création table si inexistante (fallback)
    await sql`CREATE TABLE IF NOT EXISTS beats (
      id TEXT PRIMARY KEY,
      data JSONB
    );`;

    if (request.method === 'GET') {
      const { limit } = request.query;
      const limitVal = Array.isArray(limit) ? limit[0] : limit;

      let beats;
      if (limitVal && !isNaN(Number(limitVal))) {
        const limitNum = Number(limitVal);
        // UTILISATION DE SELECT * POUR RÉCUPÉRER TOUTES LES COLONNES CRÉÉES
        beats = await sql`SELECT * FROM beats LIMIT ${limitNum}`;
      } else {
        beats = await sql`SELECT * FROM beats`;
      }
      
      const enrichedBeats = beats.map((row) => {
        try {
            // 1. Base : données JSONB
            let beatData = row.data || {};

            // Déballage si nécessaire
            if (beatData.data) {
                beatData = { ...beatData, ...beatData.data };
                delete beatData.data;
            }
            if (beatData.beat) {
                beatData = { ...beatData, ...beatData.beat };
                delete beatData.beat;
            }
            
            // 2. Initialisation de l'objet Beat
            const beat: any = {
                id: row.id,
                ...beatData
            };

            // 3. FUSION : Les colonnes explicites de la DB sont prioritaires
            if (row.title) beat.title = row.title;
            if (row.bpm) beat.bpm = Number(row.bpm);
            if (row.tags && Array.isArray(row.tags)) beat.tags = row.tags;
            if (row.cover_url) beat.coverUrl = row.cover_url;
            if (row.audio_url) beat.audioUrl = row.audio_url;
            if (row.mp3_url) beat.mp3Url = row.mp3_url;
            if (row.wav_url) beat.wavUrl = row.wav_url;
            if (row.stems_url) beat.stemsUrl = row.stems_url;
            if (row.youtube_id) beat.youtubeId = row.youtube_id;
            if (row.date) beat.date = row.date;

            // 4. Construction des Licences à partir des colonnes de prix (si présentes)
            let licenses = Array.isArray(beat.licenses) ? beat.licenses : [];

            const addOrUpdateLicense = (type: string, price: any, name: string, features: string[]) => {
                if (price === null || price === undefined) return;
                const priceNum = Number(price);
                const existingIndex = licenses.findIndex((l: any) => l.fileType === type);
                
                if (existingIndex >= 0) {
                    licenses[existingIndex].price = priceNum;
                } else {
                    licenses.push({
                        id: type.toLowerCase(),
                        name,
                        price: priceNum,
                        fileType: type,
                        features,
                        streamsLimit: type === 'EXCLUSIVE' || type === 'TRACKOUT' || type === 'WAV' ? 'Unlimited' : 500000
                    });
                }
            };

            // Mappage des colonnes de prix vers les objets License
            if (row.price_mp3) addOrUpdateLicense('MP3', row.price_mp3, 'MP3 Lease', ['MP3 Untagged', '500,000 Streams']);
            if (row.price_wav) addOrUpdateLicense('WAV', row.price_wav, 'WAV Lease', ['WAV Untagged', 'Unlimited Streams']);
            if (row.price_trackout) addOrUpdateLicense('TRACKOUT', row.price_trackout, 'Trackout Lease', ['All Stems (WAV)', 'Unlimited Streams']);
            if (row.price_exclusive) addOrUpdateLicense('EXCLUSIVE', row.price_exclusive, 'Exclusive Rights', ['Full Ownership', 'Publishing 50/50']);

            beat.licenses = licenses;

            // 5. Valeurs par défaut pour affichage
            if (!beat.title) beat.title = "Beat sans titre";
            if (!beat.coverUrl) beat.coverUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80";
            if (!beat.tags) beat.tags = [];

            // Fallback licences si vide
            if (beat.licenses.length === 0) {
                 beat.licenses = [
                    { id: 'mp3', name: 'MP3 Lease', price: 29.99, fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000 },
                    { id: 'wav', name: 'WAV Lease', price: 49.99, fileType: 'WAV', features: ['WAV Untagged', 'Unlimited Streams'], streamsLimit: 'Unlimited' }
                 ];
            }

            // 6. Gestion Date ISO
            if (!beat.date) {
                if (beat.id && typeof beat.id === 'string' && beat.id.startsWith('beat-')) {
                    const parts = beat.id.split('-');
                    if (parts.length > 1) {
                        const timestamp = parseInt(parts[1], 10);
                        if (!isNaN(timestamp) && timestamp > 1600000000000) {
                            beat.date = new Date(timestamp).toISOString();
                        } else {
                            beat.date = new Date().toISOString();
                        }
                    } else {
                        beat.date = new Date().toISOString();
                    }
                } else {
                    beat.date = new Date().toISOString();
                }
            }
            return beat;
        } catch (e) {
            console.error("Erreur parsing row:", e);
            return { id: row.id, title: "Données corrompues", date: new Date().toISOString() };
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
      
      if (!body) {
        return response.status(400).json({ error: 'Body invalide ou vide' });
      }

      let beat = body.beat || body.data || body;

      if (!beat.id) {
        beat.id = `beat-${Date.now()}`;
      }

      if (beat.date) {
         try { beat.date = new Date(beat.date).toISOString(); } catch(e) {}
      }

      const beatId = beat.id;
      const beatJson = JSON.stringify(beat);

      // Pour l'insertion, on continue de mettre à jour le JSONB 'data'
      // Si vous souhaitez synchroniser les colonnes lors de l'ajout, il faudrait modifier cette requête,
      // mais pour l'instant on garde la logique "Update JSONB" pour ne pas casser l'existant.
      await sql`
        INSERT INTO beats (id, data)
        VALUES (${beatId}, ${beatJson}::jsonb)
        ON CONFLICT (id) DO UPDATE
        SET data = beats.data || ${beatJson}::jsonb;
      `;
      
      return response.status(200).json({ success: true, id: beatId });
    }

    if (request.method === 'DELETE') {
      const { id } = request.query;
      const idVal = Array.isArray(id) ? id[0] : id;
      
      if (!idVal) {
        return response.status(400).json({ error: 'ID manquant' });
      }
      
      await sql`DELETE FROM beats WHERE id = ${idVal}`;
      return response.status(200).json({ success: true });
    }

    return response.status(405).json({ error: 'Method Not Allowed' });

  } catch (error: any) {
    console.error('Database Error:', error);
    return response.status(500).json({ 
        error: 'Erreur serveur base de données', 
        details: error.message 
    });
  }
}
