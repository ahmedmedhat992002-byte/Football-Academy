import { db, isFirebaseConfigured } from "./config";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// =========================================================================
// TYPES
// =========================================================================

export interface FirebaseCoachRecord {
  id: string;
  user_id?: string;
  full_name?: string;
  email?: string;
  phone?: string | null;
  password?: string;
  status?: "approved" | "pending_approval" | "rejected";
  specialization?: string | null;
  experience_years?: number | string | null;
  bio?: string | null;
  photo_url?: string | null;
  assigned_groups?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface FirebaseNotificationRecord {
  id?: string;
  title?: string;
  message?: string;
  description?: string;
  time?: string;
  unread?: boolean;
  read?: boolean;
  type?: string;
  href?: string;
  targetRole?: string;
  created_at?: string;
  createdAt?: string;
}

export interface FirebasePlayerRecord {
  id: string;
  full_name?: string;
  birth_date?: string;
  group_id?: string | null;
  parent_id?: string | null;
  status?: string;
  emergency_phone?: string;
  notes?: string | null;
  photo_url?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs = 2000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Firestore timeout")), timeoutMs)
    ),
  ]);
}

// =========================================================================
// COACHES FIRESTORE SYNC
// =========================================================================

export async function getFirebaseCoaches(): Promise<FirebaseCoachRecord[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const snap = await withTimeout(getDocs(collection(db, "coaches")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirebaseCoachRecord));
  } catch (error) {
    console.warn("Firestore getCoaches error:", error);
    return [];
  }
}

export async function saveFirebaseCoach(coach: FirebaseCoachRecord): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await withTimeout(setDoc(doc(db, "coaches", coach.id), coach, { merge: true }));
    return true;
  } catch (error) {
    console.error("Firestore saveCoach error:", error);
    return false;
  }
}

export async function updateFirebaseCoachStatus(
  coachId: string,
  status: "approved" | "pending_approval" | "rejected"
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await withTimeout(updateDoc(doc(db, "coaches", coachId), {
      status,
      updated_at: new Date().toISOString(),
    }));
    return true;
  } catch (error) {
    console.error("Firestore updateCoachStatus error:", error);
    return false;
  }
}

// =========================================================================
// NOTIFICATIONS FIRESTORE SYNC (Shared across all admins/devices)
// =========================================================================

export async function getFirebaseNotifications(
  role?: string
): Promise<FirebaseNotificationRecord[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const snap = await withTimeout(getDocs(collection(db, "notifications")));
    const list = snap.docs.map(
      (d) => ({ id: d.id, ...d.data() } as FirebaseNotificationRecord)
    );
    if (role) {
      return list.filter(
        (n) => !n.targetRole || n.targetRole === role || n.targetRole === "all"
      );
    }
    return list;
  } catch (error) {
    console.warn("Firestore getNotifications error:", error);
    return [];
  }
}

export async function addFirebaseNotification(
  notif: FirebaseNotificationRecord
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const notifId = notif.id || `notif-${Date.now()}`;
    await withTimeout(setDoc(doc(db, "notifications", notifId), {
      ...notif,
      id: notifId,
      created_at: notif.created_at || new Date().toISOString(),
    }));
    return true;
  } catch (error) {
    console.error("Firestore addNotification error:", error);
    return false;
  }
}

// =========================================================================
// PLAYERS FIRESTORE SYNC
// =========================================================================

export async function getFirebasePlayers(): Promise<FirebasePlayerRecord[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const snap = await getDocs(collection(db, "players"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirebasePlayerRecord));
  } catch (error) {
    console.warn("Firestore getPlayers error:", error);
    return [];
  }
}

export async function saveFirebasePlayer(player: FirebasePlayerRecord): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await setDoc(doc(db, "players", player.id), player, { merge: true });
    return true;
  } catch (error) {
    console.error("Firestore savePlayer error:", error);
    return false;
  }
}
