import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function ParentLoading() {
  return <RouteSkeleton cardCount={2} showTable={true} tableRowCount={4} />;
}
