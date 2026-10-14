import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface RouteSkeletonProps {
  cardCount?: number;
  showTable?: boolean;
  tableRowCount?: number;
}

export function RouteSkeleton({
  cardCount = 4,
  showTable = true,
  tableRowCount = 6,
}: RouteSkeletonProps) {
  return (
    <div className="space-y-6 p-4 md:p-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      {cardCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-border/60 bg-card space-y-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-20 rounded" />
              <Skeleton className="h-3 w-36 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Filter Bar Placeholder */}
      <div className="p-4 rounded-2xl border border-border/60 bg-card flex flex-wrap gap-3 items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Table / Content Skeleton */}
      {showTable && (
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          <div className="p-4 border-b border-border/40 flex items-center justify-between">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
          <div className="divide-y divide-border/30">
            {Array.from({ length: tableRowCount }).map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-6">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
