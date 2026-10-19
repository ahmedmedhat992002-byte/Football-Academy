import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function RootLoading() {
  return <RouteSkeleton cardCount={4} showTable={true} tableRowCount={5} />;
}
