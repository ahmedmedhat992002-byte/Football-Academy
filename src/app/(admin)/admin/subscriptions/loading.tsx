import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function SubscriptionsLoading() {
  return <RouteSkeleton cardCount={4} showTable={true} tableRowCount={6} />;
}
