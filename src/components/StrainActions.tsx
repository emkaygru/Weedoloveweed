"use client";

import { useState } from "react";

interface Props {
  strainId: string;
  strainName: string;
}

export default function StrainActions({ strainId, strainName }: Props) {
  const [bookmarking, setBookmarking] = useState(false);
  const [message, setMessage] = useState("");

  const bookmark = async (listType: "favorites" | "want_to_try") => {
    if (bookmarking) return;
    setBookmarking(true);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strainId, listType }),
      });
      const data = await res.json();
      setMessage(
        data.bookmarked
          ? `Added "${strainName}" to ${listType === "favorites" ? "favorites" : "try list"}!`
          : `Removed "${strainName}" from ${listType === "favorites" ? "favorites" : "try list"}`
      );
      setTimeout(() => setMessage(""), 2000);
    } catch {
      // Error
    } finally {
      setBookmarking(false);
    }
  };

  return (
    <div className="mt-4 border-t border-card-border pt-4">
      <div className="flex gap-2">
        <button
          onClick={() => bookmark("favorites")}
          disabled={bookmarking}
          className="flex-1 rounded-xl border border-accent-pink/30 bg-accent-pink/5 py-2.5 text-sm font-semibold text-accent-pink transition-colors hover:bg-accent-pink/10 disabled:opacity-50"
        >
          ❤️ Favorite
        </button>
        <button
          onClick={() => bookmark("want_to_try")}
          disabled={bookmarking}
          className="flex-1 rounded-xl border border-sativa/30 bg-sativa/5 py-2.5 text-sm font-semibold text-sativa transition-colors hover:bg-sativa/10 disabled:opacity-50"
        >
          📋 Want to Try
        </button>
      </div>
      {message && (
        <p className="mt-2 text-center text-xs font-medium text-primary">
          {message}
        </p>
      )}
    </div>
  );
}
