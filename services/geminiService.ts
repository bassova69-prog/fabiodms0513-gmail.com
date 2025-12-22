
import { GoogleGenAI, Type } from "@google/genai";

// Sécurité pour éviter le crash si la clé est undefined
const API_KEY = process.env.API_KEY || "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

const FISCAL_EXPERT_INSTRUCTION = `
Tu es l'Expert Fiscal personnel de Fabio DMS, un producteur de musique (Beatmaker) sous le statut de Micro-Entreprise BNC (Bénéfices Non Commerciaux).
Tes connaissances incluent :
1. Les taux URSSAF BNC (23,2% taux plein, 12,3% ou 13,1% avec l'ACRE).
2. Les seuils de TVA (39 100€ franchise, 47 500€ seuil majoré).
3. Les revenus SACEM (Droits d'auteur) : distinction entre déclaration BNC ou traitements et salaires.
4. L'abattement forfaitaire de 34% spécifique au BNC.
5. Le versement libératoire de l'impôt (2,2%).

Donne des conseils précis, chiffrés et rassurants. Utilise un ton professionnel mais accessible.
`;

const INVOICE_INSTRUCTION = `
Tu es un assistant comptable expert pour Micro-Entreprise. Analyse l'image de cette facture.
Extrais : Date (DD/MM/YYYY), Label (Émetteur), CustomerName (Fabio ou Client), Amount TTC, Type (IN/OUT), Category.
Réponds UNIQUEMENT au format JSON.
`;

export const analyzeInvoice = async (base64Data: string, mimeType: string): Promise<any> => {
  if (!API_KEY) throw new Error("API Key manquante");
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Analyse cette facture pour une micro-entreprise." }
        ]
      },
      config: {
        systemInstruction: INVOICE_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            label: { type: Type.STRING },
            customerName: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            type: { type: Type.STRING, enum: ['IN', 'OUT'] },
            category: { type: Type.STRING, enum: ['VENTE', 'SACEM', 'CHARGE_FIXE', 'MATERIEL', 'SERVICE', 'AIDE'] }
          },
          required: ['date', 'label', 'customerName', 'amount', 'type', 'category']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Invoice Analysis Error:", error);
    throw error;
  }
};

export const askTaxAdvisor = async (question: string): Promise<string> => {
  if (!API_KEY) return "Configuration API manquante.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Question fiscale de Fabio : "${question}"`,
      config: {
        systemInstruction: FISCAL_EXPERT_INSTRUCTION,
      },
    });
    return response.text || "Désolé, analyse impossible.";
  } catch (error) {
    console.error("Gemini Tax Advisor Error:", error);
    return "Erreur API Gemini.";
  }
};

export const analyzeContract = async (contractText: string): Promise<string> => {
  if (!API_KEY) return "Configuration API manquante.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyse ce contrat d'édition/production : \n\n"${contractText}"`,
      config: {
        systemInstruction: "Tu es un assistant juridique pour beatmakers spécialisé en droit de la propriété intellectuelle.",
      },
    });
    return response.text || "Désolé, analyse impossible.";
  } catch (error) {
    console.error("Gemini Contract Analysis Error:", error);
    return "Erreur API Gemini.";
  }
};
