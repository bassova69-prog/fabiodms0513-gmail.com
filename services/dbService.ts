
import { Beat } from '../types';

const DB_NAME = 'FabioStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'beats';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject('Erreur lors de l’ouverture de la base de données');

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event: any) => resolve(event.target.result);
  });
};

export const saveBeat = async (beat: Beat): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(beat);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Erreur lors de la sauvegarde du beat');
  });
};

export const getAllBeats = async (): Promise<Beat[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject('Erreur lors de la récupération des beats');
  });
};

export const deleteBeat = async (id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Erreur lors de la suppression du beat');
  });
};
