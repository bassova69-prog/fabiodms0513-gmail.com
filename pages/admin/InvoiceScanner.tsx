
import React, { useState, useRef } from 'react';
import { Camera, Upload, FileDigit, CheckCircle2, AlertCircle, Loader2, Save, X, Landmark, ReceiptText, User } from 'lucide-react';
import { analyzeInvoice } from '../../services/geminiService';
import { Transaction } from '../../types';

export const InvoiceScanner: React.FC = () => {
  // ... reste du composant ...
  return <div className="pb-20">Scanner de Factures</div>;
};
