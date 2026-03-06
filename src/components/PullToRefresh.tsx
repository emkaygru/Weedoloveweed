"use client";

import { useState, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function PullToRefresh({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef(0);
  const pullingRef = useRef(false);
  const THRESHOLD = 72;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pullingRef.current || window.scrollY > 0) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      // dampen the pull using rubber-band formula
      const damped = Math.min(delta * 0.45, THRESHOLD * 1.2);
      setPullY(damped);
    }
  };

  const handleTouchEnd = async () => {
    pullingRef.current = false;
    if (pullY >= THRESHOLD * 0.6 && !refreshing) {
      setRefreshing(true);
      setPullY(0);
      router.refresh();
      // hold the spinner for a beat so it feels intentional
      await new Promise((r) => setTimeout(r, 900));
      setRefreshing(false);
    } else {
      setPullY(0);
    }
  };

  const progress = Math.min(pullY / (THRESHOLD * 0.6), 1);
  const showIndicator = pullY > 4 || refreshing;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Refresh indicator */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{ height: refreshing ? 44 : pullY > 0 ? pullY : 0, opacity: showIndicator ? 1 : 0 }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
          style={{
            transform: refreshing ? "rotate(0deg)" : `rotate(${progress * 270}deg)`,
            transition: refreshing ? "none" : undefined,
            animation: refreshing ? "spin 0.7s linear infinite" : undefined,
          }}
        >
          {refreshing ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" />
              <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 transition-transform"
              style={{ transform: `rotate(${progress * 180}deg)` }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          )}
        </div>
      </div>

      {/* Page content */}
      <div
        style={{
          transform: pullY > 0 ? `translateY(${pullY * 0.25}px)` : undefined,
          transition: pullY === 0 ? "transform 0.2s ease-out" : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
