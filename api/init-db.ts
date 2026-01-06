
import { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Utilisation de la chaîne de connexion fournie
  const dbUrl = "postgresql://neondb_owner:npg_j8usSmDb5FpZ@ep-sparkling-hall-a4ygj36w-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
  const sql = neon(dbUrl);

  try {
    // 1. Création de la table settings
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Insertion d'une promo par défaut pour tester l'affichage
    const defaultPromo = {
      isActive: true,
      message: "🔥 OFFRE DE LANCEMENT : -10% SUR TOUS LES BEATS",
      type: "PERCENTAGE",
      discountPercentage: 10,
      scope: 'GLOBAL'
    };

    await sql`
      INSERT INTO settings (key, value)
      VALUES ('promo', ${JSON.stringify(defaultPromo)})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${JSON.stringify(defaultPromo)};
    `;

    return response.status(200).json({ 
      success: true, 
      message: "Table 'settings' créée et promo de test insérée avec succès !" 
    });

  } catch (error: any) {
    console.error(error);
    return response.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
