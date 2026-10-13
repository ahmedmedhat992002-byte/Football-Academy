import React from "react";
import { getCoaches } from "@/lib/actions/coaches";
import { CoachesManagerView } from "@/components/coaches/coaches-manager-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الجهاز الفني والمدربين | FIFA FC ACADEMY",
  description: "مراجعة واعتماد طلبات انضمام المدربين وإدارة الجهاز الفني في FIFA FC ACADEMY",
};

export const dynamic = "force-dynamic";

export default async function AdminCoachesPage() {
  const coaches = await getCoaches();

  return (
    <div className="space-y-6">
      <CoachesManagerView initialCoaches={coaches} />
    </div>
  );
}
