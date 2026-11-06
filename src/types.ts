export type DocumentCategory =
  | 'identity'
  | 'education'
  | 'finance'
  | 'medical'
  | 'legal'
  | 'other';

export interface VaultDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  documentNumber?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  tags: string[];
  summary: string;
  extractedText: string;
  fileName: string;
  fileSize: number; // in bytes
  mimeType: string;
  fileDataUrl?: string;
  isEncrypted: boolean;
  encryptionCipher?: string;
  encryptionSalt?: string;
  encryptionIv?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionTier = 'free' | 'premium';

export interface AdminSettings {
  ownerName: string;
  ownerEmail: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  routingNumber: string;
  swiftCode: string;
  ibanUsd: string;
  wiseEmail: string;
  bkashNumber: string;
  nagadNumber: string;
  stripePaymentLink: string;
  monthlyPriceUsd: number;
  yearlyPriceUsd: number;
  monthlyPriceBdt: number;
  yearlyPriceBdt: number;
  paymentInstructions: string;
}

export interface PaymentRecord {
  id: string;
  userEmail: string;
  userName: string;
  plan: string;
  amount: string;
  currency: string;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  notes?: string;
}

export interface AIAskResponse {
  answer: string;
  matchedDocumentIds: string[];
  confidence: 'high' | 'medium' | 'low';
  directDataExtracted?: Record<string, string>;
  suggestedFollowUps?: string[];
}
