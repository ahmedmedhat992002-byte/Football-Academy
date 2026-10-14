import { RouteSkeleton } from "@/components/ui/route-skeleton";

export default function AttendanceLoading() {
  return <RouteSkeleton cardCount={3} showTable={true} tableRowCount={6} />;
}
