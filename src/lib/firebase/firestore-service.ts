import { db, isFirebaseConfigured } from "./config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

// =========================================================================
// COACHES FIRESTORE SYNC
// =========================================================================

export async function getFirebaseCoaches(): Promise<any[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const snap = await getDocs(collection(db, "coaches"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn("Firestore getCoaches error:", error);
    return [];
  }
}

export async function saveFirebaseCoach(coach: any): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await setDoc(doc(db, "coaches", coach.id), coach, { merge: true });
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
    await updateDoc(doc(db, "coaches", coachId), {
      status,
      updated_at: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Firestore updateCoachStatus error:", error);
    return false;
  }
}

// =========================================================================
// NOTIFICATIONS FIRESTORE SYNC (Shared across all admins/devices)
// =========================================================================

export async function getFirebaseNotifications(role?: string): Promise<any[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const snap = await getDocs(collection(db, "notifications"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (role) {
      return list.filter((n: any) => !n.targetRole || n.targetRole === role || n.targetRole === "all");
    }
    return list;
  } catch (error) {
    console.warn("Firestore getNotifications error:", error);
    return [];
  }
}

export async function addFirebaseNotification(notif: any): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const notifId = notif.id || `notif-${Date.now()}`;
    await setDoc(doc(db, "notifications", notifId), {
      ...notif,
      id: notifId,
      created_at: notif.created_at || new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Firestore addNotification error:", error);
    return false;
  }
}

// =========================================================================
// PLAYERS FIRESTORE SYNC
// =========================================================================

export async function getFirebasePlayers(): Promise<any[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const snap = await getDocs(collection(db, "players"));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.warn("Firestore getPlayers error:", error);
    return [];
  }
}

export async function saveFirebasePlayer(player: any): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await setDoc(doc(db, "players", player.id), player, { merge: true });
    return true;
  } catch (error) {
    console.error("Firestore savePlayer error:", error);
    return false;
  }
}
