
import { Beat, Masterclass, FinancialData, License, Transaction, ScheduleEvent } from './types';

// Fabio's Context
export const ARTIST_NAME = "Fabio DMS";
export const CREDITS = ["Warren Saada", "Tayc", "Dadju", "Soolking"];
export const LOCATION = "Paris/Créteil";
// Ta photo officielle fournie (Nouveau Logo)
export const PROFILE_IMAGE_URL = "https://raw.githubusercontent.com/bassova69-prog/image/main/fabio.png";

export const MICRO_LIMITS = {
  TVA_BASE: 39100,
  TVA_MAX: 47500,
  CA_MAX: 77700
};

export const STANDARD_LICENSES: License[] = [
  { id: 'mp3', name: 'MP3 Lease', price: 29.99, fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000 },
  { id: 'wav', name: 'WAV Lease', price: 49.99, fileType: 'WAV', features: ['WAV Untagged', 'Unlimited Streams'], streamsLimit: 'Unlimited' },
  { id: 'trackout', name: 'Trackout Lease', price: 99.99, fileType: 'TRACKOUT', features: ['All Stems (WAV)', 'Unlimited Streams'], streamsLimit: 'Unlimited' },
  { id: 'exclusive', name: 'Exclusive Rights', price: 499.99, fileType: 'EXCLUSIVE', features: ['Full Ownership', 'Publishing 50/50'], streamsLimit: 'Unlimited' }
];

// ON VIDE LES EXEMPLES POUR NE PLUS LES AFFICHER
export const FEATURED_BEATS: Beat[] = [];

export const MASTERCLASSES: Masterclass[] = [
  { 
    id: 'mc1', 
    title: "Secrets de Production Afro-Love", 
    description: "Apprends à composer des mélodies pour Tayc & Dadju.", 
    price: 97, 
    duration: "4h 30m", 
    level: "Intermédiaire", 
    thumbnailUrl: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=500&auto=format&fit=crop&q=60" 
  }
];

export const generateFinancialProjection = (): FinancialData[] => {
  const data: FinancialData[] = [];
  for (let i = 0; i < 36; i++) {
    data.push({
      month: `${(i % 12) + 1}/2025`,
      income: 1500 + (i * 100),
      expenses: 300,
      net: 1200 + (i * 100)
    });
  }
  return data;
};

export const MOCK_TRANSACTIONS: Transaction[] = [];
export const MOCK_EVENTS: ScheduleEvent[] = [];
