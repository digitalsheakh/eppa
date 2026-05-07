import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminDb() {
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return null;
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return getFirestore();
}

export interface StripeSettings {
  publishableKey: string;
  secretKey: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  bankReference: string;
}

const defaults: StripeSettings = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  secretKey: process.env.STRIPE_SECRET_KEY ?? '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  sortCode: '',
  bankReference: 'CC-ORDER',
};

export async function getStripeSettings(): Promise<StripeSettings> {
  try {
    const db = getAdminDb();
    if (!db) return defaults;
    const snap = await db.collection('settings').doc('stripe').get();
    if (!snap.exists) return defaults;
    return { ...defaults, ...snap.data() } as StripeSettings;
  } catch {
    return defaults;
  }
}

export async function getStripeSecretKey(): Promise<string> {
  const settings = await getStripeSettings();
  return settings.secretKey;
}

export async function getStripePublishableKey(): Promise<string> {
  const settings = await getStripeSettings();
  return settings.publishableKey;
}

export async function saveStripeSettings(data: Partial<StripeSettings>): Promise<void> {
  const db = getAdminDb();
  if (!db) throw new Error('Firestore not configured');
  await db.collection('settings').doc('stripe').set(data, { merge: true });
}
