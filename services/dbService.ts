
import { Beat, StorePromotion } from '../types';

export const initDB = async (): Promise<void> => Promise.resolve();

const FALLBACK_PREFIX = 'fabio_data_';

// CACHE MÉMOIRE (RAM)
// Sauve la mise si le localStorage est plein ou pour éviter les appels réseaux inutiles
const MEMORY_CACHE: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes de cache

async function fetchItems<T>(endpoint: string): Promise<T[]> {
  const now = Date.now();
  
  // 1. Vérifier le Cache Mémoire (Priorité absolue pour économiser Neon)
  if (MEMORY_CACHE[endpoint] && (now - MEMORY_CACHE[endpoint].timestamp < CACHE_DURATION)) {
    // console.log(`[DB] Utilisation du cache mémoire pour ${endpoint}`);
    return MEMORY_CACHE[endpoint].data;
  }

  try {
    const res = await fetch(`/api/${endpoint}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    });
    
    if (!res.ok) {
        if (res.status === 404) {
            throw new Error("API_NOT_FOUND");
        }
        const errText = await res.text();
        let errMsg = errText;
        try {
            const jsonErr = JSON.parse(errText);
            errMsg = jsonErr.detail || jsonErr.error || errText;
        } catch(e) {}

        console.error(`[DB] Erreur API ${endpoint} (${res.status}):`, errMsg);
        throw new Error(`${errMsg} (${res.status})`);
    }
    
    const data = await res.json();
    
    if (Array.isArray(data)) {
        // Mise à jour du Cache Mémoire
        MEMORY_CACHE[endpoint] = { data: data, timestamp: now };

        // Tentative de sauvegarde localStorage (Bonus)
        try {
            localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(data));
        } catch (storageError) {
            // Ignorer silencieusement si quota dépassé, car on a le cache mémoire
        }
    }
    return data;
  } catch (e: any) {
    if (e.message === "API_NOT_FOUND") {
        console.warn(`[DB] API ${endpoint} non disponible (404).`);
    } else {
        console.warn(`[DB] Erreur fetch pour ${endpoint}:`, e.message);
    }
    
    // Fallback: Cache LocalStorage
    const local = localStorage.getItem(FALLBACK_PREFIX + endpoint);
    if (local) {
        try {
            const parsed = JSON.parse(local);
            // On remet en mémoire pour éviter de relire le disque
            MEMORY_CACHE[endpoint] = { data: parsed, timestamp: now };
            return parsed;
        } catch (err) {
            return [];
        }
    }
    
    // Fallback: Cache Mémoire périmé (Mieux que rien)
    if (MEMORY_CACHE[endpoint]) {
        return MEMORY_CACHE[endpoint].data;
    }

    // Au lieu de crash avec une erreur, on retourne un tableau vide si rien ne marche
    return [] as any;
  }
}

async function saveItem<T extends { id: string }>(endpoint: string, item: T): Promise<void> {
  // Optimiste UI Update
  try {
      const current = MEMORY_CACHE[endpoint]?.data || await fetchItems<T>(endpoint).catch(() => []);
      const updated = [item, ...current.filter((i: any) => i.id !== item.id)];
      
      // Update Mémoire
      MEMORY_CACHE[endpoint] = { data: updated, timestamp: Date.now() };
      
      // Update Storage
      try {
          localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(updated));
      } catch(e) {}
  } catch (e) {}

  try {
    await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  } catch (e) { console.error(e); }
}

async function deleteItem(endpoint: string, id: string): Promise<void> {
  try {
    const current = MEMORY_CACHE[endpoint]?.data || await fetchItems<any>(endpoint).catch(() => []);
    const updated = current.filter((i: any) => i.id !== id);
    
    MEMORY_CACHE[endpoint] = { data: updated, timestamp: Date.now() };
    
    try {
        localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(updated));
    } catch(e) {}
  } catch (e) {}

  try {
    await fetch(`/api/${endpoint}?id=${id}`, { method: 'DELETE' });
  } catch (e) {}
}

export const checkConnection = async (): Promise<{ success: boolean; message: string; mode: 'CLOUD' | 'LOCAL' }> => {
  try {
    // On force un appel réseau léger pour vérifier la co
    const res = await fetch(`/api/beats?limit=1&t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      return { success: true, message: "Base de Données Connectée", mode: 'CLOUD' };
    }
    if (res.status === 404) throw new Error("API non déployée");
    throw new Error(`API Status ${res.status}`);
  } catch (e: any) {
    return { success: true, message: `Mode Hors Ligne`, mode: 'LOCAL' };
  }
};

export const saveBeat = (beat: Beat) => saveItem('beats', beat);
export const getAllBeats = () => fetchItems<Beat>('beats');
export const deleteBeat = (id: string) => deleteItem('beats', id);

export const getActivePromotion = async (): Promise<StorePromotion | null> => {
    try {
        // On interroge la nouvelle API dédiée qui lit la table store_promotions
        const res = await fetch(`/api/promotions?t=${Date.now()}`);
        if (res.ok) {
            const data = await res.json();
            return data;
        }
    } catch (e) {
        console.error("Error fetching promotion:", e);
    }
    return null;
};

export const getSetting = async <T>(key: string): Promise<T | null> => {
  const cacheKey = `setting_${key}`;
  const now = Date.now();

  if (MEMORY_CACHE[cacheKey] && (now - MEMORY_CACHE[cacheKey].timestamp < CACHE_DURATION)) {
      return MEMORY_CACHE[cacheKey].data;
  }

  try {
    const res = await fetch(`/api/settings?key=${key}&t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
        const val = await res.json();
        MEMORY_CACHE[cacheKey] = { data: val, timestamp: now };
        try {
            localStorage.setItem(FALLBACK_PREFIX + cacheKey, JSON.stringify(val));
        } catch(e) {}
        return val;
    }
    throw new Error();
  } catch (e) {
    const local = localStorage.getItem(FALLBACK_PREFIX + cacheKey);
    return local ? JSON.parse(local) : null;
  }
};

export const saveSetting = async (key: string, value: any): Promise<void> => {
  const cacheKey = `setting_${key}`;
  MEMORY_CACHE[cacheKey] = { data: value, timestamp: Date.now() };
  try {
      localStorage.setItem(FALLBACK_PREFIX + cacheKey, JSON.stringify(value));
  } catch(e) {}
  
  try {
    await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
    });
  } catch (e) {}
};
