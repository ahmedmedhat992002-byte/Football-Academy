import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { LandingPageView } from "@/components/landing/landing-page-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FIFA FC ACADEMY | صناع الأبطال ومصنع النجوم الكروية",
  description: "أكاديمية FIFA FC ACADEMY — الأكاديمية التدريبية الأولى لتطوير مهارات الناشئين والبراعم بإشراف نخبة من المدربين المعتمدين ومنظومة رقمية متكاملة.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  return <LandingPageView currentUser={user} />;
}
