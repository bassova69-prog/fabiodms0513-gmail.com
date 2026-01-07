
import { Beat } from '../types';

export const initDB = async (): Promise<void> => Promise.resolve();

const FALLBACK_PREFIX = 'fabio_data_';

async function fetchItems<T>(endpoint: string): Promise<T[]> {
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
        // On essaie de parser le JSON d'erreur si possible
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
        try {
            localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(data));
        } catch (storageError) {
            // C'est ici que l'erreur "Quota exceeded" se produisait et bloquait tout.
            // On log un avertissement mais on NE LANCE PAS d'erreur, pour que 'data' soit retourné.
            console.warn(`[DB] Cache local plein pour ${endpoint} (Quota dépassé). Utilisation des données en direct uniquement.`);
        }
    }
    return data;
  } catch (e: any) {
    if (e.message === "API_NOT_FOUND") {
        console.warn(`[DB] API ${endpoint} non disponible (404).`);
    } else {
        console.warn(`[DB] Erreur fetch pour ${endpoint}:`, e.message);
    }
    
    const local = localStorage.getItem(FALLBACK_PREFIX + endpoint);
    
    if (!local) {
        throw e;
    }

    try {
        const parsed = JSON.parse(local);
        return parsed;
    } catch (err) {
        return [];
    }
  }
}

async function saveItem<T extends { id: string }>(endpoint: string, item: T): Promise<void> {
  try {
    const current = await fetchItems<T>(endpoint).catch(() => []);
    const updated = [item, ...current.filter((i: any) => i.id !== item.id)];
    try {
        localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(updated));
    } catch(e) { console.warn("Quota exceeded in saveItem"); }
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
    const current = await fetchItems<any>(endpoint).catch(() => []);
    const updated = current.filter((i: any) => i.id !== id);
    try {
        localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(updated));
    } catch(e) { console.warn("Quota exceeded in deleteItem"); }
  } catch (e) {}

  try {
    await fetch(`/api/${endpoint}?id=${id}`, { method: 'DELETE' });
  } catch (e) {}
}

export const checkConnection = async (): Promise<{ success: boolean; message: string; mode: 'CLOUD' | 'LOCAL' }> => {
  try {
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

export const getSetting = async <T>(key: string): Promise<T | null> => {
  try {
    const res = await fetch(`/api/settings?key=${key}&t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
        const val = await res.json();
        try {
            localStorage.setItem(FALLBACK_PREFIX + 'setting_' + key, JSON.stringify(val));
        } catch(e) {}
        return val;
    }
    throw new Error();
  } catch (e) {
    const local = localStorage.getItem(FALLBACK_PREFIX + 'setting_' + key);
    return local ? JSON.parse(local) : null;
  }
};

export const saveSetting = async (key: string, value: any): Promise<void> => {
  try {
      localStorage.setItem(FALLBACK_PREFIX + 'setting_' + key, JSON.stringify(value));
  } catch(e) {}
  
  try {
    await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
    });
  } catch (e) {}
};
