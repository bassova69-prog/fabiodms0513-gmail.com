
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const DB_URL = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const sql = neon(DB_URL);

  try {
    // S'assurer que la table existe
    await sql`CREATE TABLE IF NOT EXISTS beats (
      id TEXT PRIMARY KEY,
      data JSONB
    );`;

    if (request.method === 'GET') {
      const { limit } = request.query;
      
      let rows;
      // On récupère TOUT (*) pour avoir accès à title, price_lease, etc.
      if (limit && !isNaN(Number(limit))) {
        rows = await sql`SELECT * FROM beats LIMIT ${Number(limit)}`;
      } else {
        rows = await sql`SELECT * FROM beats`;
      }
      
      const enrichedBeats = rows.map((row) => {
        try {
            // 1. On part des données JSON s'il y en a, sinon objet vide
            let beatData = row.data;
            if (typeof beatData === 'string') {
                try { beatData = JSON.parse(beatData); } catch (e) { beatData = {}; }
            }
            if (!beatData || typeof beatData !== 'object') beatData = {};
            
            // Gestion des structures imbriquées
            if (beatData.data) beatData = { ...beatData, ...beatData.data };
            if (beatData.beat) beatData = { ...beatData, ...beatData.beat };

            // 2. Initialisation de l'objet Beat avec l'ID
            const beat: any = {
                id: row.id,
                ...beatData
            };

            // 3. MAPPING EXPLICTE DES COLONNES NEON (Priorité Absolue)
            // Si la colonne existe dans la ligne SQL, on l'utilise
            
            if (row.title) beat.title = row.title;
            if (row.bpm) beat.bpm = Number(row.bpm);
            if (row.cover_url) beat.coverUrl = row.cover_url;
            
            // URLs Audio & Vidéo
            if (row.audio_url) beat.audioUrl = row.audio_url; // Preview player
            if (row.mp3_url) beat.mp3Url = row.mp3_url;
            if (row.wav_url) beat.wavUrl = row.wav_url;
            if (row.stems_url) beat.stemsUrl = row.stems_url;
            if (row.youtube_id) beat.youtubeId = row.youtube_id;
            
            // Date
            if (row.date) beat.date = row.date;
            else if (row.created_at) beat.date = new Date(row.created_at).toISOString();

            // Tags (Array Postgres ou String)
            if (row.tags) {
                if (Array.isArray(row.tags)) {
                    beat.tags = row.tags;
                } else if (typeof row.tags === 'string') {
                    // Nettoyage format postgres {tag1,tag2}
                    const cleaned = row.tags.replace('{', '').replace('}', '');
                    beat.tags = cleaned.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                }
            }

            // 4. CONSTRUCTION DES LICENCES VIA LES COLONNES DE PRIX
            // C'est ici que 'price_lease' est transformé en licence affichable
            const licenses = [];

            const createLic = (id: string, name: string, price: any, type: string, features: string[]) => {
                const p = Number(price);
                if (!isNaN(p) && p > 0) {
                    licenses.push({
                        id,
                        name,
                        price: p,
                        fileType: type,
                        features,
                        streamsLimit: (type === 'EXCLUSIVE' || type === 'TRACKOUT' || type === 'WAV') ? 'Unlimited' : 500000
                    });
                }
            };

            // On utilise 'price_lease' ou 'price_mp3' pour le MP3
            const mp3Price = row.price_mp3 || row.price_lease; 
            
            createLic('mp3', 'MP3 Lease', mp3Price, 'MP3', ['MP3 Untagged', '500,000 Streams']);
            createLic('wav', 'WAV Lease', row.price_wav, 'WAV', ['WAV Untagged', 'Unlimited Streams']);
            createLic('trackout', 'Trackout Lease', row.price_trackout, 'TRACKOUT', ['All Stems (WAV)', 'Unlimited Streams']);
            createLic('exclusive', 'Exclusive Rights', row.price_exclusive, 'EXCLUSIVE', ['Full Ownership', 'Publishing 50/50']);

            // Si on a trouvé des prix dans les colonnes, on écrase les licences existantes
            if (licenses.length > 0) {
                beat.licenses = licenses;
            } else if (!beat.licenses || beat.licenses.length === 0) {
                // Fallback ultime
                 beat.licenses = [
                    { id: 'mp3', name: 'MP3 Lease', price: 29.99, fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000 }
                 ];
            }

            // 5. Sécurités d'affichage
            if (!beat.title) beat.title = "Beat " + (beat.id ? beat.id.slice(-5) : "");
            if (!beat.coverUrl) beat.coverUrl = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80";
            if (!beat.tags) beat.tags = [];
            if (!beat.date) beat.date = new Date().toISOString();

            return beat;
        } catch (e) {
            console.error("Erreur parsing row:", e);
            return null;
        }
      }).filter(Boolean); // Retire les éléments null

      // Tri par date décroissante
      enrichedBeats.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateB - dateA;
      });

      return response.status(200).json(enrichedBeats);
    }

    if (request.method === 'POST') {
      const body = request.body;
      if (!body) return response.status(400).json({ error: 'Body invalide' });
      
      // Support pour format direct ou imbriqué
      let beat = body.beat || body.data || body;
      
      if (!beat.id) beat.id = `beat-${Date.now()}`;
      const beatId = beat.id;
      const beatJson = JSON.stringify(beat);

      // Note: Pour l'instant on sauvegarde dans JSONB 'data'.
      // Idéalement, il faudrait aussi INSERT dans les colonnes spécifiques si vous voulez modifier les données via cette API.
      // Ici on assure au moins la compatibilité.
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
