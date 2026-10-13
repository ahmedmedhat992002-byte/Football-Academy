import { auth, db, isFirebaseConfigured } from "./config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { UserRole } from "@/types/database.types";

export interface FirebaseUserProfile {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  status: "active" | "pending_approval" | "suspended";
  childName?: string;
  childBirthDate?: string;
  ageCategory?: string;
  specialization?: string;
  experienceYears?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createFirebaseUser(params: {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  childName?: string;
  childBirthDate?: string;
  ageCategory?: string;
  specialization?: string;
  experienceYears?: string;
}): Promise<{ success: boolean; uid?: string; error?: string }> {
  if (!isFirebaseConfigured || !auth || !db) {
    return { success: false, error: "Firebase is not configured" };
  }

  try {
    // 1. Create User in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, params.email, params.password);
    const user = userCredential.user;

    // 2. Update Display Name
    try {
      await updateProfile(user, { displayName: params.fullName });
    } catch {
      // Non-critical
    }

    // 3. Save profile document in Firestore 'users' collection
    const userProfile: FirebaseUserProfile = {
      uid: user.uid,
      email: params.email,
      fullName: params.fullName,
      phone: params.phone,
      role: params.role,
      status: params.role === "coach" ? "pending_approval" : "active",
      childName: params.childName,
      childBirthDate: params.childBirthDate,
      ageCategory: params.ageCategory,
      specialization: params.specialization,
      experienceYears: params.experienceYears,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", user.uid), userProfile);

    // 4. If parent with child, save player in 'players' collection
    if (params.role === "parent" && params.childName) {
      await addDoc(collection(db, "players"), {
        parentId: user.uid,
        parentName: params.fullName,
        parentPhone: params.phone,
        fullName: params.childName,
        birthDate: params.childBirthDate || null,
        ageCategory: params.ageCategory || "U10",
        status: "active",
        createdAt: new Date().toISOString(),
      });
    }

    return { success: true, uid: user.uid };
  } catch (error: any) {
    console.error("Error creating user in Firebase:", error);
    let message = "فشل إنشاء الحساب في فايربيز";
    if (error.code === "auth/email-already-in-use") {
      message = "البريد الإلكتروني مسجل بالفعل مسبقاً";
    } else if (error.code === "auth/weak-password") {
      message = "كلمة المرور يجب أن لا تقل عن 6 أحرف";
    } else if (error.message) {
      message = error.message;
    }
    return { success: false, error: message };
  }
}

export async function saveTrialBookingToFirestore(data: {
  parentName: string;
  childName: string;
  phone: string;
  ageCategory: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isFirebaseConfigured || !db) {
    return { success: false, error: "Firebase is not configured" };
  }

  try {
    const docRef = await addDoc(collection(db, "trial_bookings"), {
      ...data,
      status: "new",
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error("Error saving trial booking to Firebase:", error);
    return { success: false, error: error.message || "فشل تسجيل طلب الاختبار" };
  }
}
