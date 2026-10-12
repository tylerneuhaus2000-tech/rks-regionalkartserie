"use client";

import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { firebaseConfig, firebaseConfigured } from "@/lib/firebase-config";
export { firebaseConfigured };
let app: FirebaseApp | undefined;
export function getFirebaseApp() { if (!firebaseConfigured) return undefined; app ??= getApps().length ? getApp() : initializeApp(firebaseConfig); return app; }
export function getFirebaseAuth(): Auth | undefined { const current=getFirebaseApp(); return current ? getAuth(current) : undefined; }
export function getFirebaseDb(): Firestore | undefined { const current=getFirebaseApp(); return current ? getFirestore(current) : undefined; }
