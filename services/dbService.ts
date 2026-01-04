
import { Beat } from '../types';

// L'initialisation de la DB se fait désormais côté serveur (API), 
// on garde cette fonction vide pour compatibilité si nécessaire.
export const initDB = async (): Promise<void> => {
  return Promise.resolve();
};

export const saveBeat = async (beat: Beat): Promise<void> => {
  try {
    const response = await fetch('/api/beats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(beat),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
       throw new Error("L'API a renvoyé une réponse non-JSON (HTML). Vérifiez la configuration vercel.json.");
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erreur lors de la sauvegarde sur le serveur');
    }
  } catch (error) {
    console.error("Save Beat Error:", error);
    throw error;
  }
};

export const getAllBeats = async (): Promise<Beat[]> => {
  try {
    const response = await fetch('/api/beats');
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
       console.error("L'API a renvoyé du HTML au lieu du JSON. Vérifiez la configuration des rewrites Vercel.");
       // Retourne un tableau vide pour ne pas faire planter l'interface
       return [];
    }
    
    if (!response.ok) {
      throw new Error('Impossible de récupérer les beats depuis le serveur');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch Beats Error:", error);
    return [];
  }
};

export const deleteBeat = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/beats?id=${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la suppression sur le serveur');
    }
  } catch (error) {
    console.error("Delete Beat Error:", error);
    throw error;
  }
};
