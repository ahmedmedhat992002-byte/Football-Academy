"use client";

import React, { useEffect, useState, useRef, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
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
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMiniLogo, setShowMiniLogo] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Complete loading when pathname or searchParams change
  const handleNavigationComplete = React.useCallback(() => {
    if (isLoading) {
      setProgress(100);
      const finishTimeout = setTimeout(() => {
        setIsLoading(false);
        setShowMiniLogo(false);
        setIsSlow(false);
        setProgress(0);
      }, 180);
      return () => clearTimeout(finishTimeout);
    }
  }, [isLoading]);

  // Start progress bar animation
  const startProgress = (customText?: string) => {
    setIsLoading(true);
    setProgress(15);
    setIsSlow(false);

    // Increment progress in stages
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 60) return prev + 15;
        if (prev < 85) return prev + 6;
        if (prev < 95) return prev + 1;
        return prev;
      });
    }, 120);

    // If navigation takes longer than 180ms, show the floating mini logo
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowMiniLogo(true);
    }, 180);

    // If it takes longer than 2.5s (hanging or very slow network), mark as slow
    if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    slowTimerRef.current = setTimeout(() => {
      setIsSlow(true);
    }, 2500);
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
    }, 150);
  };

  // Intercept all internal link clicks to give instant visual feedback
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, downloads, new tabs, anchors (#)
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if clicking current URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) {
        return;
      }

      // Start the progress indicator instantly
      startProgress();
    };

    // Listen for custom loading events (e.g. form submissions, heavy actions)
    const handleCustomStart = () => startProgress();
    const handleCustomStop = () => stopProgress();

    document.addEventListener("click", handleLinkClick, { passive: true });
    window.addEventListener("academy_start_loading", handleCustomStart);
    window.addEventListener("academy_stop_loading", handleCustomStop);

    return () => {
      document.removeEventListener("click", handleLinkClick);
      window.removeEventListener("academy_start_loading", handleCustomStart);
      window.removeEventListener("academy_stop_loading", handleCustomStop);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
    };
  }, []);

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

      {/* Floating Mini Logo Loader when navigation takes > 180ms or on slow network */}
      {showMiniLogo && (
        <LogoLoader
          size="sm"
          variant="floating"
          text={isSlow ? "الشبكة بطيئة، جاري الانتقال..." : "جاري الانتقال..."}
          subtext={isSlow ? "FIFA FC • يرجى الانتظار" : "FIFA FC ACADEMY"}
          isSlowNetwork={isSlow}
        />
      )}

      {children}
    </>
  );
}
