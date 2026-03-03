"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FABMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const items = [
    {
      label: "Log Session",
      emoji: "🌿",
      description: "Rate a strain",
      href: "/log/new",
    },
    {
      label: "High Thought",
      emoji: "💭",
      description: "Share what's on your mind",
      href: "/thought/new",
    },
    {
      label: "Try List",
      emoji: "📋",
      description: "Save a strain for later",
      href: "/search?addToTry=1",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu items */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
        {open &&
          items.map((item, i) => (
            <button
              key={item.href}
              onClick={() => {
                setOpen(false);
                router.push(item.href);
              }}
              className="flex items-center gap-3 rounded-2xl border border-card-border bg-card px-4 py-3 shadow-lg transition-all"
              style={{
                animation: `fadeSlideUp 0.2s ease-out ${i * 0.05}s both`,
              }}
            >
              <div>
                <p className="text-right text-sm font-semibold">{item.label}</p>
                <p className="text-right text-xs text-muted">{item.description}</p>
              </div>
              <span className="text-2xl">{item.emoji}</span>
            </button>
          ))}
      </div>

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform active:scale-95"
        style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
      >
        <span className="text-2xl text-white">+</span>
      </button>

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
