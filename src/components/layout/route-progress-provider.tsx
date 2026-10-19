"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { LogoLoader } from "@/components/ui/logo-loader";

function RouteWatcher({ onComplete }: { onComplete: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    onComplete();
  }, [pathname, searchParams, onComplete]);

  return null;
}

export function RouteProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMiniLogo, setShowMiniLogo] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Complete loading when pathname or searchParams change - ultra fast cleanup
  const handleNavigationComplete = React.useCallback(() => {
    if (isLoading) {
      setProgress(100);
      const finishTimeout = setTimeout(() => {
        setIsLoading(false);
        setShowMiniLogo(false);
        setIsSlow(false);
        setProgress(0);
      }, 60);
      return () => clearTimeout(finishTimeout);
    }
  }, [isLoading]);

  // Start progress bar animation
  const startProgress = (customText?: string) => {
    setIsLoading(true);
    setProgress(30);
    setIsSlow(false);

    // Increment progress rapidly
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 70) return prev + 25;
        if (prev < 90) return prev + 8;
        if (prev < 98) return prev + 1;
        return prev;
      });
    }, 70);

    // Only show the luxury loading card if navigation actually lags (> 420ms) or hangs
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowMiniLogo(true);
    }, 420);

    // If it takes longer than 2.0s (slow network), mark as slow
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => {
      setIsSlow(true);
    }, 2000);
  };

  const stopProgress = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setShowMiniLogo(false);
      setIsSlow(false);
      setProgress(0);
    }, 50);
  };

  // Intercept all internal link clicks + prefetch on hover/touch for instant 0ms clicks
  useEffect(() => {
    const isInternalLink = (target: HTMLElement | null): string | null => {
      const anchor = target?.closest("a");
      if (!anchor) return null;
      const href = anchor.getAttribute("href");
      if (!href) return null;
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        anchor.target === "_blank"
      ) {
        return null;
      }
      return href;
    };

    // Instant prefetch on mouse hover or touch start
    const handlePrefetch = (e: MouseEvent | TouchEvent) => {
      const href = isInternalLink(e.target as HTMLElement);
      if (href && href !== window.location.pathname) {
        try {
          router.prefetch(href);
        } catch {
          // Ignore prefetch error
        }
      }
    };

    const handleLinkClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = isInternalLink(e.target as HTMLElement);
      if (!href) return;

      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      startProgress();
    };

    // Listen for custom loading events
    const handleCustomStart = () => startProgress();
    const handleCustomStop = () => stopProgress();

    document.addEventListener("click", handleLinkClick, { passive: true });
    document.addEventListener("mouseover", handlePrefetch, { passive: true });
    document.addEventListener("touchstart", handlePrefetch, { passive: true });
    window.addEventListener("academy_start_loading", handleCustomStart);
    window.addEventListener("academy_stop_loading", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleLinkClick);
      document.removeEventListener("mouseover", handlePrefetch);
      document.removeEventListener("touchstart", handlePrefetch);
      window.removeEventListener("academy_start_loading", handleCustomStart);
      window.removeEventListener("academy_stop_loading", handleCustomStop);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, [router]);

  return (
    <>
      <React.Suspense fallback={null}>
        <RouteWatcher onComplete={handleNavigationComplete} />
      </React.Suspense>

      {/* Top Gold Glowing Progress Bar */}
      {isLoading && (
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[3px] bg-transparent"
        >
          <div
            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_12px_#F59E0B] transition-all ease-out"
            style={{
              width: `${progress}%`,
              transitionDuration: progress === 100 ? "150ms" : "250ms",
            }}
          />
        </div>
      )}

      {/* Pure Cosmic FIFA FC Emblem when navigation lags (> 420ms) or hangs */}
      {showMiniLogo && (
        <LogoLoader
          variant="floating"
          size="md"
        />
      )}

      {children}
    </>
  );
}
