import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function CoachesLoading() {
  return <RouteSkeleton cardCount={3} showTable={true} tableRowCount={5} />;
}
