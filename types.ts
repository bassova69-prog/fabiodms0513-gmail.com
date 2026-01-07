
export interface License {
  id: string;
  name: string;
  price: number;
  fileType: 'MP3' | 'WAV' | 'TRACKOUT' | 'EXCLUSIVE';
  features: string[];
  streamsLimit: number | 'Unlimited';
}

export interface StorePromotion {
  isActive: boolean;
  discountPercentage: number;
  message: string;
  type?: 'PERCENTAGE' | 'BULK_DEAL';
  scope?: 'GLOBAL' | 'SPECIFIC';
  targetBeatIds?: string[];
}

export interface Beat {
  id: string;
  title: string;
  bpm: number;
  key?: string;
  tags: string[];
  
  // Format Base de données (snake_case)
  cover_url: string; 
  mp3_url?: string;   
  wav_url?: string;   
  stems_url?: string; 
  youtube_id?: string;
  
  // Données calculées / UI
  audioUrl?: string; // Gardé pour compatibilité lecteur, souvent alias de mp3_url
  licenses: License[];
  description?: string;
  date?: string;
  created_at?: string;
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

export interface CartItem {
  id: string;
  beat: Beat;
  license: License;
}

export interface Transaction {
  id: string;
  date: string;
  label: string;
  customer?: string;
  category: 'VENTE' | 'SACEM' | 'AIDE' | 'CHARGE_FIXE' | 'MATERIEL' | 'SERVICE';
  amount: number;
  type: 'IN' | 'OUT';
  status: 'PAYÉ' | 'EN_ATTENTE';
}

export interface ContractArchive {
  id: string;
  title: string;
  date: string;
  content: string;
  analysis: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'STUDIO' | 'DEADLINE' | 'ADMIN';
  status: 'PENDING' | 'DONE';
  artist?: string;
  notes?: string;
}
