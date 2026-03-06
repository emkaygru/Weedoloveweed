"use client";

import { useRouter } from "next/navigation";

interface Props {
  label?: string;
  fallbackHref?: string;
  className?: string;
}

export default function BackButton({ label = "Back", fallbackHref = "/", className = "" }: Props) {
  const router = useRouter();

  const handleBack = () => {
    // If there's history, go back; otherwise go to fallback
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground active:opacity-70 ${className}`}
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5M12 5l-7 7 7 7" />
      </svg>
      {label}
    </button>
  );
}
