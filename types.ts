
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
  audioUrl?: string; // Fallback / Preview
  mp3Url?: string;   // Fichier MP3 final
  wavUrl?: string;   // Fichier WAV final
  stemsUrl?: string; // Dossier Stems (souvent ZIP)
  coverUrl: string;
  licenses: License[];
  youtubeId?: string;
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
