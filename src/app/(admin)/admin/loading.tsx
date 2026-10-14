import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function AdminLoading() {
  return <RouteSkeleton cardCount={4} showTable={true} tableRowCount={6} />;
}
