"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getFirebaseNotifications, addFirebaseNotification } from "@/lib/firebase/firestore-service";

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: "registration" | "payment" | "attendance" | "evaluation" | "session";
  href: string;
  targetRole?: "admin" | "coach" | "parent" | "all";
  createdAt: string;
}

const NOTIFICATIONS_COOKIE = "academy_system_notifications";

const DEFAULT_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-init-1",
    title: "مرحباً بك في منظومة الأكاديمية",
    description: "النظام مفعل وجاهز لاستقبال اشتراكات اللاعبين وتسجيل الحضور الميداني",
    time: "الآن",
    unread: true,
    type: "session",
    href: "/admin",
    targetRole: "admin",
    createdAt: new Date().toISOString(),
  },
];

export async function getNotifications(userRole: "admin" | "coach" | "parent" = "admin"): Promise<SystemNotification[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(NOTIFICATIONS_COOKIE)?.value;

  let allNotifications: SystemNotification[] = [];

  if (raw) {
    try {
      allNotifications = JSON.parse(decodeURIComponent(raw));
    } catch {
      try {
        allNotifications = JSON.parse(raw);
      } catch {
        allNotifications = DEFAULT_NOTIFICATIONS;
      }
    }
  } else {
    allNotifications = DEFAULT_NOTIFICATIONS;
  }

  // If Firebase is configured, merge cloud notifications so all devices get them
  if (isFirebaseConfigured) {
    try {
      const fbNotifs = await getFirebaseNotifications(userRole);
      if (fbNotifs.length > 0) {
        const notifMap = new Map<string, SystemNotification>();
        [...fbNotifs, ...allNotifications].forEach((n) => notifMap.set(n.id || n.title, n));
        allNotifications = Array.from(notifMap.values());
      }
    } catch (fbErr) {
      console.warn("Firestore notification fetch fallback:", fbErr);
    }
  }

  // Filter notifications relevant to this user role
  return allNotifications.filter(
    (n) => !n.targetRole || n.targetRole === "all" || n.targetRole === userRole
  );
}

export async function addNotification(notification: Omit<SystemNotification, "id" | "time" | "createdAt" | "unread">): Promise<void> {
  const cookieStore = await cookies();
  const current = await getNotifications("admin");

  const newNotification: SystemNotification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    time: "الآن",
    unread: true,
    createdAt: new Date().toISOString(),
  };

  const updated = [newNotification, ...current].slice(0, 30); // Keep last 30

  cookieStore.set(NOTIFICATIONS_COOKIE, encodeURIComponent(JSON.stringify(updated)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // Persist to Cloud Firestore for cross-device alerts
  if (isFirebaseConfigured) {
    try {
      await addFirebaseNotification(newNotification);
    } catch (fbErr) {
      console.warn("Firestore addNotification fallback:", fbErr);
    }
  }

  revalidatePath("/", "layout");
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const cookieStore = await cookies();
  const current = await getNotifications("admin");

  const updated = current.map((n) => ({ ...n, unread: false }));

  cookieStore.set(NOTIFICATIONS_COOKIE, encodeURIComponent(JSON.stringify(updated)), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/", "layout");
}
