
import { Beat, Transaction, ContractArchive, ScheduleEvent } from '../types';

export const initDB = async (): Promise<void> => Promise.resolve();

const FALLBACK_PREFIX = 'fabio_data_';

// --- GENERIC HELPERS WITH FALLBACK ---
async function fetchItems<T>(endpoint: string): Promise<T[]> {
  try {
    // Tentative de connexion API (Neon DB) avec cache busting strict
    const res = await fetch(`/api/${endpoint}?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        }
    });
    
    if (!res.ok) throw new Error(`API Error ${res.status}`);
    
    const data = await res.json();
    // Si succès, on met à jour le cache local pour le futur
    localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(data));
    return data;
  } catch (e) {
    console.warn(`[DB] Mode Hors Ligne activé pour ${endpoint}. Lecture locale.`);
    // Fallback: Lecture du LocalStorage
    const local = localStorage.getItem(FALLBACK_PREFIX + endpoint);
    return local ? JSON.parse(local) : [];
  }
}

async function saveItem<T extends { id: string }>(endpoint: string, item: T): Promise<void> {
  // 1. Sauvegarde Locale immédiate (Optimistic UI)
  try {
    const current = await fetchItems<T>(endpoint);
    const updated = [item, ...current.filter((i: any) => i.id !== item.id)];
    localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(updated));
  } catch (e) {
    console.warn("Erreur sauvegarde locale:", e);
  }

  // 2. Tentative Sauvegarde Cloud (Neon DB)
  try {
    const res = await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error("Echec sauvegarde Cloud");
  } catch (e) {
    console.error(`[DB] Erreur sauvegarde Cloud pour ${endpoint}. Données conservées localement.`, e);
    // On ne throw pas pour ne pas bloquer l'UI, car c'est sauvegardé localement
  }
}

async function deleteItem(endpoint: string, id: string): Promise<void> {
  // 1. Suppression Locale
  try {
    const current = await fetchItems<any>(endpoint);
    const updated = current.filter((i: any) => i.id !== id);
    localStorage.setItem(FALLBACK_PREFIX + endpoint, JSON.stringify(updated));
  } catch (e) {}

  // 2. Suppression Cloud
  try {
    await fetch(`/api/${endpoint}?id=${id}`, { method: 'DELETE' });
  } catch (e) {
    console.warn(`[DB] Erreur suppression Cloud:`, e);
  }
}

// --- CONNECTION CHECK ---
export const checkConnection = async (): Promise<{ success: boolean; message: string; mode: 'CLOUD' | 'LOCAL' }> => {
  try {
    const res = await fetch(`/api/beats?limit=1&t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
      return { success: true, message: "Base de Données Neon Connectée", mode: 'CLOUD' };
    }
    throw new Error(`API Status ${res.status}`);
  } catch (e: any) {
    return { 
        success: true, // On renvoie true pour dire "L'app est fonctionnelle" (en mode local)
        message: "Mode Hors Ligne (Sauvegarde Locale)", 
        mode: 'LOCAL' 
    };
  }
};

// --- BEATS ---
export const saveBeat = (beat: Beat) => saveItem('beats', beat);
export const getAllBeats = () => fetchItems<Beat>('beats');
export const deleteBeat = (id: string) => deleteItem('beats', id);

// --- TRANSACTIONS ---
export const saveTransaction = (tx: Transaction) => saveItem('transactions', tx);
export const getAllTransactions = () => fetchItems<Transaction>('transactions');
export const deleteTransaction = (id: string) => deleteItem('transactions', id);

// --- CONTRACTS ---
export const saveContract = (c: ContractArchive) => saveItem('contracts', c);
export const getAllContracts = () => fetchItems<ContractArchive>('contracts');
export const deleteContract = (id: string) => deleteItem('contracts', id);

// --- EVENTS ---
export const saveEvent = (ev: ScheduleEvent) => saveItem('events', ev);
export const getAllEvents = () => fetchItems<ScheduleEvent>('events');
export const deleteEvent = (id: string) => deleteItem('events', id);

// --- SETTINGS ---
export const getSetting = async <T>(key: string): Promise<T | null> => {
  try {
    const res = await fetch(`/api/settings?key=${key}&t=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) {
        const val = await res.json();
        localStorage.setItem(FALLBACK_PREFIX + 'setting_' + key, JSON.stringify(val));
        return val;
    }
    throw new Error("Fetch failed");
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
