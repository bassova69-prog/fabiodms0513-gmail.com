
export interface License {
  id: string;
  name: string;
  price: number;
  fileType: 'MP3' | 'WAV' | 'TRACKOUT' | 'EXCLUSIVE';
  features: string[];
  streamsLimit: number | 'Unlimited';
}

export interface Beat {
  id: string;
  title: string; // "AMOUR | Tayc Type Beat"
  bpm: number;
  key: string;
  tags: string[];
  audioUrl?: string;
  coverUrl: string;
  licenses: License[]; // New leasing structure
  youtubeId?: string; // For the funnel
  description?: string;
}

export interface Masterclass {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  thumbnailUrl: string;
}

export interface FinancialData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export enum LegalStatus {
  AUTO_ENTREPRENEUR = 'Auto-Entrepreneur',
  EURL = 'EURL',
  SASU = 'SASU'
}

export interface LegalAdvice {
  status: LegalStatus;
  pros: string[];
  cons: string[];
  recommendationScore: number; // 1-10
}

export interface CartItem {
  id: string; // Unique ID for the cart entry (beatId + licenseId)
  beat: Beat;
  license: License;
}

export interface Transaction {
  id: string;
  date: string;
  label: string;
  customer?: string; // Nom du client ou de la société facturée
  category: 'VENTE' | 'SACEM' | 'AIDE' | 'CHARGE_FIXE' | 'MATERIEL' | 'SERVICE';
  amount: number;
  type: 'IN' | 'OUT';
  status: 'PAYÉ' | 'EN_ATTENTE';
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: 'STUDIO' | 'DEADLINE' | 'ADMIN';
  status: 'PENDING' | 'DONE';
  artist?: string;
  notes?: string;
}
