
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
            // On crée l'objet beat en utilisant directement les colonnes remplies
            const beat: any = {
            id: row.id,
            title: row.title || "Sans titre",
            bpm: row.bpm ? Number(row.bpm) : null,
            coverUrl: row.cover_url || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80",
            date: row.date || (row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()),
            mp3Url: row.mp3_url || null,
            // On ajoute les autres URLs si elles existent dans vos colonnes
            wavUrl: row.wav_url || null,
            stemsUrl: row.stems_url || null,
            youtubeId: row.youtube_id || null
            };

            // Gestion des tags (si la colonne existe)
            if (row.tags) {
                if (Array.isArray(row.tags)) {
                    beat.tags = row.tags;
                } else if (typeof row.tags === 'string') {
                    beat.tags = row.tags.split(',').map((t: string) => t.trim());
                } else {
                    beat.tags = [];
                }
            } else {
            beat.tags = [];
            }

            // Reconstruction des licences à partir des colonnes de prix
            const licenses = [];
            if (row.price_mp3 || row.price_lease) {
            licenses.push({
                id: 'mp3',
                name: 'MP3 Lease',
                price: Number(row.price_mp3 || row.price_lease),
                fileType: 'MP3',
                features: ['MP3 Untagged', '500,000 Streams'],
                streamsLimit: 500000
            });
            }
            
            // ... faire pareil pour WAV et EXCLUSIVE si les colonnes existent ...
            if (row.price_wav) {
                licenses.push({
                    id: 'wav',
                    name: 'WAV Lease',
                    price: Number(row.price_wav),
                    fileType: 'WAV',
                    features: ['WAV Untagged', 'Unlimited Streams'],
                    streamsLimit: 'Unlimited'
                });
            }

            if (row.price_trackout) {
                licenses.push({
                    id: 'trackout',
                    name: 'Trackout Lease',
                    price: Number(row.price_trackout),
                    fileType: 'TRACKOUT',
                    features: ['All Stems (WAV)', 'Unlimited Streams'],
                    streamsLimit: 'Unlimited'
                });
            }

            if (row.price_exclusive) {
                licenses.push({
                    id: 'exclusive',
                    name: 'Exclusive Rights',
                    price: Number(row.price_exclusive),
                    fileType: 'EXCLUSIVE',
                    features: ['Full Ownership', 'Publishing 50/50'],
                    streamsLimit: 'Unlimited'
                });
            }

            // Fallback si aucune licence n'est trouvée (pour éviter un affichage vide)
            if (licenses.length === 0) {
                 licenses.push({
                    id: 'mp3',
                    name: 'MP3 Lease',
                    price: 29.99,
                    fileType: 'MP3',
                    features: ['MP3 Untagged', '500,000 Streams'],
                    streamsLimit: 500000
                 });
            }
            
            beat.licenses = licenses;

            return beat;
        } catch (e) {
            console.error("Erreur mapping row:", e);
            return null;
        }
      }).filter(Boolean);

      // Tri par date décroissante
      enrichedBeats.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return response.status(200).json(enrichedBeats);
    }

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
