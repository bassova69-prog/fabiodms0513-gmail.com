
import { Beat, Transaction, ContractArchive, ScheduleEvent } from '../types';

export const initDB = async (): Promise<void> => Promise.resolve();

const FALLBACK_PREFIX = 'fabio_data_';

async function fetchItems<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await fetch(`/api/${endpoint}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
    });
    
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    const data = await res.json();
    
    if (Array.isArray(data)) {
        localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(data));
    }
    return data;
  } catch (e) {
    console.warn(`[DB] Mode Hors Ligne pour ${endpoint}`);
    const local = localStorage.getItem(FALLBACK_PREFIX + endpoint);
    if (!local) return [];

    try {
        const parsed = JSON.parse(local);
        
        // --- MISE A JOUR SNAKE_CASE ---
        // On vérifie maintenant que les beats ont bien 'cover_url' (nouveau standard)
        // Si on trouve du 'coverUrl' (ancien standard), on purge le cache
        if (endpoint === 'beats' && Array.isArray(parsed) && parsed.length > 0) {
            const sample = parsed[0];
            // Si on a coverUrl (camel) mais pas cover_url (snake), c'est un vieux cache => PURGE
            if ('coverUrl' in sample && !('cover_url' in sample)) {
                console.warn("[DB] Cache obsolète (camelCase détecté). Purge.");
                localStorage.removeItem(FALLBACK_PREFIX + endpoint);
                return [];
            }
        }
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
    throw new Error(`API Status ${res.status}`);
  } catch (e: any) {
    return { success: true, message: "Mode Hors Ligne", mode: 'LOCAL' };
  }
};

export const saveBeat = (beat: Beat) => saveItem('beats', beat);
export const getAllBeats = () => fetchItems<Beat>('beats');
export const deleteBeat = (id: string) => deleteItem('beats', id);

export const saveTransaction = (tx: Transaction) => saveItem('transactions', tx);
export const getAllTransactions = () => fetchItems<Transaction>('transactions');
export const deleteTransaction = (id: string) => deleteItem('transactions', id);

export const saveContract = (c: ContractArchive) => saveItem('contracts', c);
export const getAllContracts = () => fetchItems<ContractArchive>('contracts');
export const deleteContract = (id: string) => deleteItem('contracts', id);

export const saveEvent = (ev: ScheduleEvent) => saveItem('events', ev);
export const getAllEvents = () => fetchItems<ScheduleEvent>('events');
export const deleteEvent = (id: string) => deleteItem('events', id);

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
