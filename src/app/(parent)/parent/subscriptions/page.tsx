import { redirect } from "next/navigation";

export default function ParentSubscriptionsRedirect() {
  redirect("/parent/payments");
}
