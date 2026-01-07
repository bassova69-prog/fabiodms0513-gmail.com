
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
        console.error(`[DB] Erreur API ${endpoint} (${res.status}):`, errText);
        throw new Error(`API Error ${res.status}: ${errText}`);
    }
    
    const data = await res.json();
    
    if (Array.isArray(data)) {
        localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(data));
    }
    return data;
  } catch (e: any) {
    if (e.message === "API_NOT_FOUND") {
        console.warn(`[DB] API ${endpoint} non disponible (404). Utilisation du cache local.`);
    } else {
        console.warn(`[DB] Passage en mode local pour ${endpoint} suite à :`, e.message);
    }
    
    const local = localStorage.getItem(FALLBACK_PREFIX + endpoint);
    if (!local) return [];

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
    const current = await fetchItems<T>(endpoint);
    const updated = [item, ...current.filter((i: any) => i.id !== item.id)];
    localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(updated));
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
    const current = await fetchItems<any>(endpoint);
    const updated = current.filter((i: any) => i.id !== id);
    localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(updated));
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
        localStorage.setItem(FALLBACK_PREFIX + 'setting_' + key, JSON.stringify(val));
        return val;
    }
    throw new Error();
  } catch (e) {
    const local = localStorage.getItem(FALLBACK_PREFIX + 'setting_' + key);
    return local ? JSON.parse(local) : null;
  }
};

export const saveSetting = async (key: string, value: any): Promise<void> => {
  localStorage.setItem(FALLBACK_PREFIX + 'setting_' + key, JSON.stringify(value));
  try {
    await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
    });
  } catch (e) {}
};
