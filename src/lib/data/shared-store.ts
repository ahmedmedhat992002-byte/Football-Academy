import fs from "fs";
import path from "path";
import type { Player, PlayerSubscription, PaymentRecord } from "@/lib/data/academy-store";

export interface SharedRegisteredUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: "admin" | "coach" | "parent";
  passwordHash?: string;
  childName?: string;
  childBirthDate?: string;
  ageCategory?: string;
  createdAt: string;
}

export interface AcademySharedData {
  players: Player[];
  subscriptions: PlayerSubscription[];
  registeredUsers: SharedRegisteredUser[];
  payments: PaymentRecord[];
}

declare global {
  // eslint-disable-next-line no-var
  var __academy_shared_store: AcademySharedData | undefined;
}

function getStorageFilePath(): string {
  try {
    if (process.env.VERCEL) {
      return path.join("/tmp", ".academy-shared-data.json");
    }
    return path.join(process.cwd(), ".academy-shared-data.json");
  } catch {
    return path.join(process.cwd(), ".academy-shared-data.json");
  }
}

function loadFromFile(): AcademySharedData {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(content);
      return {
        players: Array.isArray(parsed.players) ? parsed.players : [],
        subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
        registeredUsers: Array.isArray(parsed.registeredUsers) ? parsed.registeredUsers : [],
        payments: Array.isArray(parsed.payments) ? parsed.payments : [],
      };
    }
  } catch (err) {
    console.warn("Failed to read shared store from file:", err);
  }
  return {
    players: [],
    subscriptions: [],
    registeredUsers: [],
    payments: [],
  };
}

function saveToFile(data: AcademySharedData): void {
  try {
    const filePath = getStorageFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write shared store to file:", err);
  }
}

export function getSharedStore(): AcademySharedData {
  if (!globalThis.__academy_shared_store) {
    globalThis.__academy_shared_store = loadFromFile();
  }
  return globalThis.__academy_shared_store;
}

export function persistSharedStore(updater: (data: AcademySharedData) => void): AcademySharedData {
  const store = getSharedStore();
  updater(store);
  saveToFile(store);
  return store;
}

// --- Player Helpers ---
export function getSharedPlayers(): Player[] {
  return getSharedStore().players;
}

export function saveSharedPlayer(player: Player): void {
  persistSharedStore((store) => {
    const idx = store.players.findIndex((p) => p.id === player.id);
    if (idx >= 0) {
      store.players[idx] = player;
    } else {
      store.players.unshift(player);
    }
  });
}

// --- Subscription Helpers ---
export function getSharedSubscriptions(): PlayerSubscription[] {
  return getSharedStore().subscriptions;
}

export function saveSharedSubscription(subscription: PlayerSubscription): void {
  persistSharedStore((store) => {
    const idx = store.subscriptions.findIndex((s) => s.id === subscription.id);
    if (idx >= 0) {
      store.subscriptions[idx] = subscription;
    } else {
      store.subscriptions.unshift(subscription);
    }
  });
}

// --- Registered Users Helpers ---
export function getSharedRegisteredUsers(): SharedRegisteredUser[] {
  return getSharedStore().registeredUsers;
}

export function saveSharedRegisteredUser(user: SharedRegisteredUser): void {
  persistSharedStore((store) => {
    const idx = store.registeredUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      store.registeredUsers[idx] = user;
    } else {
      store.registeredUsers.unshift(user);
    }
  });
}

// --- Payments Helpers ---
export function getSharedPayments(): PaymentRecord[] {
  return getSharedStore().payments;
}

export function saveSharedPayment(payment: PaymentRecord): void {
  persistSharedStore((store) => {
    const idx = store.payments.findIndex((p) => p.id === payment.id);
    if (idx >= 0) {
      store.payments[idx] = payment;
    } else {
      store.payments.unshift(payment);
    }
  });
}
