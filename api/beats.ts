
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
      
      let rows;
      // Nous sélectionnons explicitement les colonnes pour garantir qu'elles sont trouvées
      // même si le schéma a évolué récemment.
      // On utilise le COALESCE pour gérer les cas NULL potentiels directement en SQL si besoin,
      // mais ici on fait simple pour laisser le JS gérer.
      if (limit && !isNaN(Number(limit))) {
        const limitNum = Number(limit);
        rows = await sql`
          SELECT 
            id, data, title, bpm, cover_url, audio_url, mp3_url, wav_url, stems_url, 
            youtube_id, date, tags, 
            price_mp3, price_wav, price_trackout, price_exclusive, price_lease 
          FROM beats 
          LIMIT ${limitNum}
        `;
      } else {
        rows = await sql`
          SELECT 
            id, data, title, bpm, cover_url, audio_url, mp3_url, wav_url, stems_url, 
            youtube_id, date, tags, 
            price_mp3, price_wav, price_trackout, price_exclusive, price_lease 
          FROM beats
        `;
      }
      
      const enrichedBeats = rows.map((row) => {
        try {
            // 1. Base : données JSONB (fallback)
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
            
            // 2. Initialisation de l'objet Beat avec l'ID (toujours présent)
            const beat: any = {
                id: row.id,
                ...beatData // On étale les données JSONB en premier (priorité faible)
            };

            // 3. FUSION : Les colonnes explicites de la DB écrasent le JSONB (priorité forte)
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

            // 4. Construction des Licences
            let licenses = Array.isArray(beat.licenses) ? beat.licenses : [];

            const addOrUpdateLicense = (type: string, price: any, name: string, features: string[]) => {
                if (price === null || price === undefined) return;
                const priceNum = Number(price);
                if (isNaN(priceNum)) return;

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

            // Mappage des colonnes de prix
            // On utilise price_lease comme fallback pour le MP3 si price_mp3 est vide
            const mp3Price = row.price_mp3 !== null ? row.price_mp3 : row.price_lease;
            
            if (mp3Price !== null) addOrUpdateLicense('MP3', mp3Price, 'MP3 Lease', ['MP3 Untagged', '500,000 Streams']);
            if (row.price_wav) addOrUpdateLicense('WAV', row.price_wav, 'WAV Lease', ['WAV Untagged', 'Unlimited Streams']);
            if (row.price_trackout) addOrUpdateLicense('TRACKOUT', row.price_trackout, 'Trackout Lease', ['All Stems (WAV)', 'Unlimited Streams']);
            if (row.price_exclusive) addOrUpdateLicense('EXCLUSIVE', row.price_exclusive, 'Exclusive Rights', ['Full Ownership', 'Publishing 50/50']);

            beat.licenses = licenses;

            // 5. Valeurs par défaut CRITIQUES pour l'affichage
            if (!beat.title) beat.title = "Beat " + (row.id ? row.id.substring(0, 8) : "Inconnu");
            if (!beat.coverUrl) beat.coverUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80";
            if (!beat.tags) beat.tags = [];

            // Fallback licences si vide pour éviter une carte "non achetable"
            if (beat.licenses.length === 0) {
                 beat.licenses = [
                    { id: 'mp3', name: 'MP3 Lease', price: 29.99, fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000 },
                 ];
            }

            // 6. Gestion Date
            if (!beat.date) {
                // Tentative extraction timestamp ID
                if (beat.id && typeof beat.id === 'string' && beat.id.startsWith('beat-')) {
                    const parts = beat.id.split('-');
                    if (parts.length > 1) {
                        const timestamp = parseInt(parts[1], 10);
                        if (!isNaN(timestamp) && timestamp > 1600000000000) {
                            beat.date = new Date(timestamp).toISOString();
                        }
                    }
                }
                // Si toujours pas de date, date du jour pour ne pas briser le tri
                if (!beat.date) beat.date = new Date().toISOString();
            }

            return beat;
        } catch (e) {
            console.error("Erreur parsing row:", e);
            // On retourne un objet minimal fonctionnel en cas d'erreur
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

    // ... (Reste des méthodes POST/DELETE inchangées)
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
