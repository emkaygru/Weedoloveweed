"use client";

import { useState, useRef, useEffect } from "react";

const REACTIONS = ["❤️", "🔥", "😂", "😮", "💚"];

interface Props {
  entryId?: string;
  thoughtId?: string;
  initialLiked: boolean;
  initialCount: number;
  initialEmoji?: string | null;
  allReactions?: { userId: string; emoji: string }[];
  currentUserId?: string;
}

export default function LikeButton({
  entryId,
  thoughtId,
  initialLiked,
  initialCount,
  initialEmoji,
  allReactions = [],
  currentUserId,
}: Props) {
  const [reactions, setReactions] = useState(allReactions);
  const [myEmoji, setMyEmoji] = useState<string | null>(initialLiked ? (initialEmoji ?? "❤️") : null);
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    }
    if (showPicker) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  const react = async (emoji: string) => {
    setShowPicker(false);
    const prev = myEmoji;
    const isSame = myEmoji === emoji;

    // Optimistic update
    setMyEmoji(isSame ? null : emoji);
    setReactions((prev_r) => {
      const without = prev_r.filter((r) => r.userId !== currentUserId);
      if (isSame) return without;
      return [...without, { userId: currentUserId ?? "", emoji }];
    });

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, thoughtId, emoji }),
      });
      const data = await res.json();
      if (!data.liked) {
        setMyEmoji(null);
        setReactions((r) => r.filter((x) => x.userId !== currentUserId));
      } else {
        setMyEmoji(data.emoji);
        setReactions((prev_r) => {
          const without = prev_r.filter((x) => x.userId !== currentUserId);
          return [...without, { userId: currentUserId ?? "", emoji: data.emoji }];
        });
      }
    } catch {
      // Revert
      setMyEmoji(prev);
      setReactions(allReactions);
    }
  };

  // Group reactions by emoji for display
  const groups = REACTIONS.map((e) => ({
    emoji: e,
    count: reactions.filter((r) => r.emoji === e).length,
  })).filter((g) => g.count > 0);

  const totalCount = reactions.length;

  return (
    <div className="relative flex items-center gap-1" ref={pickerRef}>
      {/* Reaction emoji picker */}
      {showPicker && (
        <div className="absolute bottom-8 left-0 z-50 flex gap-1.5 rounded-2xl border border-card-border bg-card p-2 shadow-lg">
          {REACTIONS.map((e) => (
            <button
              key={e}
              onClick={() => react(e)}
              className={`rounded-full px-1.5 py-1 text-lg transition-transform hover:scale-125 ${
                myEmoji === e ? "bg-primary/10 ring-1 ring-primary" : ""
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Main reaction button */}
      <button
        onClick={() => {
          if (myEmoji) {
            react(myEmoji); // untoggle current
          } else {
            setShowPicker((v) => !v);
          }
        }}
        className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors ${
          myEmoji
            ? "bg-accent-pink/10 text-accent-pink"
            : "text-muted hover:text-accent-pink"
        }`}
      >
        <span>{myEmoji ?? "🤍"}</span>
        {totalCount > 0 && <span>{totalCount}</span>}
      </button>

      {/* Add reaction button (when no reaction yet) */}
      {!myEmoji && (
        <button
          onClick={() => setShowPicker((v) => !v)}
          className="rounded-full px-2 py-1 text-xs text-muted hover:text-foreground"
          aria-label="React"
        >
          +
        </button>
      )}

      {/* Inline reaction counts */}
      {groups.length > 0 && (
        <div className="flex items-center gap-1">
          {groups.map((g) => (
            <button
              key={g.emoji}
              onClick={() => react(g.emoji)}
              className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs transition-colors ${
                myEmoji === g.emoji
                  ? "bg-primary/15 text-primary"
                  : "bg-card-border/40 text-muted hover:bg-card-border"
              }`}
            >
              {g.emoji} {g.count}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
