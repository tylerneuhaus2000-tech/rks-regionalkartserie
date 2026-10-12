"use client";

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export const firebaseConfigured = Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);
let app: FirebaseApp | undefined;
export function getFirebaseApp() { if (!firebaseConfigured) return undefined; app ??= getApps().length ? getApp() : initializeApp(config); return app; }
export function getFirebaseAuth(): Auth | undefined { const current=getFirebaseApp(); return current ? getAuth(current) : undefined; }
export function getFirebaseDb(): Firestore | undefined { const current=getFirebaseApp(); return current ? getFirestore(current) : undefined; }
