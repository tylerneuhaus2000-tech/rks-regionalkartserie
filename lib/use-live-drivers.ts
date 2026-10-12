"use client";

import { useEffect, useState } from "react";
import { drivers as initialDrivers } from "@/lib/rks-data";
import type { Driver } from "@/lib/rks-data";
import { firebaseConfigured } from "@/lib/firebase-config";

/** The 2026 archive is canonical. Published Firestore entries are used for later seasons. */
export function useLiveDrivers(season = 2026) {
  const [remote, setRemote] = useState<{ season: number; drivers: Driver[] }>({ season, drivers: [] });
  useEffect(() => {
    if (season === 2026 || !firebaseConfigured) return;
    let cancelled = false;
    let unsubscribe = () => {};
    void Promise.all([import("firebase/firestore"), import("@/lib/firebase-client")]).then(([firestore, firebase]) => {
      const db = firebase.getFirebaseDb();
      if (!db || cancelled) return;
      const liveQuery = firestore.query(
        firestore.collection(db, "driverSeasonEntries"),
        firestore.where("published", "==", true),
        firestore.where("active", "==", true),
        firestore.where("seasonId", "==", String(season)),
      );
      unsubscribe = firestore.onSnapshot(liveQuery, (snapshot) => {
        void Promise.all(snapshot.docs.map(async (record, index): Promise<Driver | null> => {
          const entry = record.data();
          const driverId = String(entry.driverId ?? "");
          if (!driverId) return null;
          const identity = await firestore.getDoc(firestore.doc(db, "drivers", driverId));
          if (!identity.exists()) return null;
          const driver = identity.data();
          return {
            id: driverId,
            name: String(driver.name ?? ""),
            slug: String(driver.slug ?? driverId.toLowerCase()),
            points: Number(entry.points ?? 0),
            position: Number(entry.position ?? index + 1),
          } satisfies Driver;
        })).then((rows) => {
          if (cancelled) return;
          const next = rows.filter((row): row is Driver => row !== null && Boolean(row.name?.length));
          next.sort((a, b) => a.position - b.position);
          setRemote({ season, drivers: next });
        }).catch((error) => console.error("Could not resolve published RKS driver identities", error));
      }, (error) => console.error("Could not load published RKS driver entries", error));
    }).catch((error) => console.error("Could not initialize RKS standings", error));
    return () => { cancelled = true; unsubscribe(); };
  }, [season]);
  return season === 2026 ? initialDrivers : remote.season === season ? remote.drivers : [];
}
