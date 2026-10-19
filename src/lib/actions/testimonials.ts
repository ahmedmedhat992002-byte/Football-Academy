"use server";

import { revalidatePath } from "next/cache";
import {
  type Testimonial,
  INITIAL_TESTIMONIALS,
} from "@/lib/data/academy-store";
import {
  getSharedTestimonials,
  saveSharedTestimonial,
  deleteSharedTestimonial,
} from "@/lib/data/shared-store";
import { addNotification } from "@/lib/actions/notifications";

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const custom = getSharedTestimonials();
    const map = new Map<string, Testimonial>();

    // Initial default testimonials
    INITIAL_TESTIMONIALS.forEach((t) => map.set(t.id, t));

    // Custom testimonials override or prepend
    (custom || []).forEach((t) => map.set(t.id, t));

    const list = Array.from(map.values());
    // Sort so custom/newest are first, followed by default
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  } catch (err) {
    console.error("Failed to load testimonials:", err);
    return INITIAL_TESTIMONIALS;
  }
}

export async function createTestimonialAction(input: {
  parent_name: string;
  child_name?: string;
  age_category?: string;
  rating: number;
  content: string;
  parent_email?: string;
}): Promise<{ success: boolean; data?: Testimonial; error?: string }> {
  try {
    const parentName = (input.parent_name || "").trim();
    const content = (input.content || "").trim();
    const rating = Math.min(5, Math.max(1, Number(input.rating) || 5));

    if (!parentName) {
      return { success: false, error: "يرجى كتابة اسم ولي الأمر" };
    }
    if (!content || content.length < 5) {
      return { success: false, error: "يرجى كتابة تفاصيل رأيك وتجربتك (على الأقل 5 أحرف)" };
    }

    const newTestimonial: Testimonial = {
      id: `testim-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      parent_name: parentName,
      child_name: input.child_name?.trim() || undefined,
      age_category: input.age_category?.trim() || "U10",
      rating,
      content,
      is_verified: true,
      parent_email: input.parent_email?.toLowerCase().trim() || undefined,
      created_at: new Date().toISOString(),
    };

    saveSharedTestimonial(newTestimonial);

    // Notify Admin
    try {
      await addNotification({
        title: "تقييم ورأي جديد من ولي أمر! ⭐⚽",
        description: `أضاف ولي الأمر (${parentName}) تقييماً (${rating}/5 نجوم): "${content.slice(0, 75)}..."`,
        type: "session",
        href: "/",
        targetRole: "admin",
      });
    } catch {
      // Ignore notification error
    }

    revalidatePath("/");
    revalidatePath("/parent");
    return { success: true, data: newTestimonial };
  } catch (err) {
    console.error("Failed to create testimonial:", err);
    return { success: false, error: "تعذر حفظ التقييم والرأي" };
  }
}

export async function deleteTestimonialAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    deleteSharedTestimonial(id);
    revalidatePath("/");
    revalidatePath("/parent");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete testimonial:", err);
    return { success: false, error: "تعذر حذف التقييم" };
  }
}
