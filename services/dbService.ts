
import { Beat, Transaction, ContractArchive, ScheduleEvent, StorePromotion } from '../types';

export const initDB = async (): Promise<void> => Promise.resolve();

// --- GENERIC HELPERS ---
async function fetchItems<T>(endpoint: string): Promise<T[]> {
  try {
    const res = await fetch(`/api/${endpoint}`);
    if (!res.ok) {
      console.warn(`[DB] Fetch failed for ${endpoint}: ${res.status} ${res.statusText}`);
      return [];
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) return [];
    return await res.json();
  } catch (e) {
    console.warn(`[DB] Network error for ${endpoint}:`, e);
    return [];
  }
}

async function saveItem<T>(endpoint: string, item: T): Promise<void> {
  const res = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error(`Error saving to ${endpoint}`);
}

async function deleteItem(endpoint: string, id: string): Promise<void> {
  const res = await fetch(`/api/${endpoint}?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Error deleting from ${endpoint}`);
}

// --- CONNECTION CHECK ---
export const checkConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // Tentative de fetch léger avec timestamp pour éviter le cache
    const res = await fetch(`/api/beats?limit=1&t=${Date.now()}`);
    if (res.ok) {
      return { success: true, message: "Base de Données Neon Connectée" };
    }
    return { success: false, message: `Erreur API: ${res.status} ${res.statusText}` };
  } catch (e) {
    return { success: false, message: "Serveur injoignable (Check Logs)" };
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

// --- SETTINGS (Promo, PIN) ---
export const getSetting = async <T>(key: string): Promise<T | null> => {
  try {
    // Ajout d'un timestamp pour éviter le cache navigateur local
    const res = await fetch(`/api/settings?key=${key}&t=${Date.now()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
};

export const saveSetting = async (key: string, value: any): Promise<void> => {
  await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
};
