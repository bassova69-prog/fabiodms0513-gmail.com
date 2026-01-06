
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    // 1. Création de la table settings (Aligné avec api/settings.ts)
    await sql`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB,
      updated_at TIMESTAMP DEFAULT NOW()
    );`;

    // 2. Insertion d'une promo par défaut pour tester l'affichage
    // Note : Adaptation des champs pour correspondre à l'interface TypeScript du Frontend (StorePromotion)
    const defaultPromo = {
      isActive: true,
      message: "🔥 OFFRE DE LANCEMENT : -10% SUR TOUS LES BEATS",
      type: "PERCENTAGE",
      discountPercentage: 10, // Renommé de 'value' à 'discountPercentage' pour compatibilité frontend
      scope: 'GLOBAL'
    };

    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES ('promo', ${JSON.stringify(defaultPromo)}, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET value = ${JSON.stringify(defaultPromo)}, updated_at = NOW();
    `;

    return response.status(200).json({ 
      success: true, 
      message: "Table 'settings' créée et promo de test insérée avec succès !" 
    });

  } catch (error: any) {
    console.error(error);
    return response.status(500).json({ 
      success: false, 
      error: String(error) 
    });
  }
}
