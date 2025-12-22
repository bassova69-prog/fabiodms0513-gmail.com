
import { Beat, Masterclass, FinancialData, LegalAdvice, LegalStatus, License, Transaction, ScheduleEvent } from './types';

// Fabio's Context
export const ARTIST_NAME = "Fabio DMS";
export const CREDITS = ["Warren Saada", "Tayc", "Dadju", "Soolking"];
export const LOCATION = "Paris/Créteil";
export const PROFILE_IMAGE_URL = "https://raw.githubusercontent.com/bassova69-prog/fabiodms0513-gmail.com/main/527337417_18517551331032986_3060701978807061030_n.jpg";

// Seuils Micro-Entreprise 2025 (BNC - Prestations de services)
export const MICRO_LIMITS = {
  TVA_BASE: 39100, // Seuil de franchise (ne pas facturer de TVA)
  TVA_MAX: 47500,  // Seuil majoré (bascule immédiate vers la TVA)
  CA_MAX: 77700    // Seuil limite du statut auto-entrepreneur
};

export const STANDARD_LICENSES: License[] = [
  { id: 'mp3', name: 'MP3 Lease', price: 29.99, fileType: 'MP3', features: ['MP3 Untagged', '500,000 Streams'], streamsLimit: 500000 },
  { id: 'wav', name: 'WAV Lease', price: 49.99, fileType: 'WAV', features: ['WAV Untagged', 'Unlimited Streams'], streamsLimit: 'Unlimited' },
  { id: 'trackout', name: 'Trackout Lease', price: 99.99, fileType: 'TRACKOUT', features: ['All Stems (WAV)', 'Unlimited Streams'], streamsLimit: 'Unlimited' },
  { id: 'exclusive', name: 'Exclusive Rights', price: 499.99, fileType: 'EXCLUSIVE', features: ['Full Ownership', 'Publishing 50/50'], streamsLimit: 'Unlimited' }
];

// Catalogue pré-rempli pour Fabio
export const FEATURED_BEATS: Beat[] = [
  {
    id: 'demo-1',
    title: 'AMOUR | Afro Love Type Beat',
    bpm: 105,
    key: 'C Minor',
    tags: ['Tayc', 'Afro', 'Love'],
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    licenses: STANDARD_LICENSES,
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 'demo-2',
    title: 'PRINCE | Zouk/Kompa Modern',
    bpm: 95,
    key: 'F# Major',
    tags: ['Kompa', 'Zouk', 'Fabio'],
    coverUrl: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    licenses: STANDARD_LICENSES,
    youtubeId: 'dQw4w9WgXcQ'
  },
  {
    id: 'demo-3',
    title: 'DOUCEUR | Kizomba Vibe',
    bpm: 88,
    key: 'A Minor',
    tags: ['Kizomba', 'Smooth', 'Chill'],
    coverUrl: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=500&auto=format&fit=crop&q=60',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    licenses: STANDARD_LICENSES
  }
];

export const MASTERCLASSES: Masterclass[] = [
  { id: 'mc1', title: "Secrets de Production Afro-Love", description: "Mélodies pour Tayc & Dadju.", price: 97, duration: "4h 30m", level: "Intermédiaire", thumbnailUrl: "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=500&auto=format&fit=crop&q=60" }
];

// Financial Projection Spécial Micro (ACRE + BNC)
export const generateFinancialProjection = (): FinancialData[] => {
  const data: FinancialData[] = [];
  const startYear = 2025;
  const startMonth = 12;

  for (let i = 0; i < 36; i++) {
    const currentMonthIndex = startMonth + i - 1;
    const year = startYear + Math.floor(currentMonthIndex / 12);
    const month = (currentMonthIndex % 12) + 1;
    const monthLabel = `${month < 10 ? '0' + month : month}/${year}`;
    
    const baseBeatSales = 800 + (i * 100); 
    let totalRevenue = baseBeatSales;
    if (i < 12) totalRevenue += 1350;

    let urssafRate = 0.232; 
    if (i === 0) urssafRate = 0.123;
    else if (i < 12) urssafRate = 0.131;
    
    const taxRate = 0.022;
    const socialCharges = baseBeatSales * urssafRate;
    const incomeTax = baseBeatSales * taxRate;
    const fixedExpenses = 60;

    const totalOut = socialCharges + incomeTax + fixedExpenses;

    data.push({
      month: monthLabel,
      income: totalRevenue,
      expenses: totalOut,
      net: totalRevenue - totalOut
    });
  }
  return data;
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '06/12/2025', label: 'Virement Pôle Emploi (ARE)', customer: 'France Travail', category: 'AIDE', amount: 1350, type: 'IN', status: 'PAYÉ' },
  { id: 't2', date: '08/12/2025', label: 'Vente Beat - AMOUR (Lease)', customer: 'Jean Dupont', category: 'VENTE', amount: 29.99, type: 'IN', status: 'PAYÉ' },
  { id: 't3', date: '10/12/2025', label: 'Masterclass Afro-Love', customer: 'Studio 24', category: 'VENTE', amount: 97, type: 'IN', status: 'PAYÉ' },
  { id: 't5', date: '06/12/2025', label: 'Abonnement BeatStars', customer: 'BeatStars Inc.', category: 'SERVICE', amount: 19.99, type: 'OUT', status: 'PAYÉ' },
  { id: 't6', date: '15/12/2025', label: 'Vente Exclu - PRINCE', customer: 'Label Rec', category: 'VENTE', amount: 499.99, type: 'IN', status: 'PAYÉ' },
];

export const MOCK_EVENTS: ScheduleEvent[] = [
  { id: 'e1', title: 'Lancement Micro-Entreprise 🚀', date: '2025-12-06', time: '09:00', type: 'ADMIN', status: 'DONE', notes: 'Début ACRE' },
  { id: 'e4', title: 'Déclaration URSSAF Mensuelle', date: '2026-01-31', time: '09:00', type: 'ADMIN', status: 'PENDING', notes: 'Déclarer le CA de Décembre' },
];
