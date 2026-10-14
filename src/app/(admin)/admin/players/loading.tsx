import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function PlayersLoading() {
  return <RouteSkeleton cardCount={4} showTable={true} tableRowCount={8} />;
}
