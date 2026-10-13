import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell userRole="parent" userName={user.fullName || "ولي أمر اللاعب"} hideSidebar={true}>
      {children}
    </AppShell>
  );
}
