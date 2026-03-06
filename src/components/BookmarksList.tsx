"use client";

import { useState } from "react";
import Link from "next/link";

interface BookmarkStrain {
  id: string;
  name: string;
  type: string;
  thcPercent: number | null;
  cbdPercent: number | null;
}

interface Bookmark {
  id: string;
  listType: string;
  strain: BookmarkStrain;
}

interface Props {
  initialBookmarks: Bookmark[];
  initialPublic: boolean;
}

function StrainItem({ strain }: { strain: BookmarkStrain }) {
  return (
    <Link
      href={`/strain/${strain.id}`}
      className="flex items-center justify-between rounded-lg border border-card-border px-3 py-2.5 transition-colors hover:bg-primary/5 active:scale-[0.98] active:opacity-80"
    >
      <div>
        <p className="text-sm font-medium">{strain.name}</p>
        {(strain.thcPercent || strain.cbdPercent) && (
          <p className="mt-0.5 text-xs text-muted">
            {strain.thcPercent ? `THC ${strain.thcPercent}%` : ""}
            {strain.thcPercent && strain.cbdPercent ? " · " : ""}
            {strain.cbdPercent ? `CBD ${strain.cbdPercent}%` : ""}
          </p>
        )}
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs capitalize ${
          strain.type === "indica"
            ? "bg-indica/10 text-indica"
            : strain.type === "sativa"
              ? "bg-sativa/10 text-sativa"
              : "bg-hybrid/10 text-hybrid"
        }`}
      >
        {strain.type}
      </span>
    </Link>
  );
}

export default function BookmarksList({ initialBookmarks, initialPublic }: Props) {
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [saving, setSaving] = useState(false);

  const favorites = initialBookmarks.filter((b) => b.listType === "favorites");
  const wantToTry = initialBookmarks.filter((b) => b.listType === "want_to_try");

  const toggleVisibility = async () => {
    if (saving) return;
    setSaving(true);
    const newVal = !isPublic;
    setIsPublic(newVal);
    try {
      await fetch("/api/profile/bookmarks-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: newVal }),
      });
    } catch {
      setIsPublic(!newVal); // revert on error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-card-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Saved Strains</p>
        <button
          onClick={toggleVisibility}
          disabled={saving}
          className="flex items-center gap-1 rounded-full border border-card-border px-3 py-1 text-xs text-muted transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          {isPublic ? (
            <>
              <span>👁</span>
              <span>Visible to friends</span>
            </>
          ) : (
            <>
              <span>🔒</span>
              <span>Only me</span>
            </>
          )}
        </button>
      </div>

      {initialBookmarks.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-2xl">🌿</p>
          <p className="mt-1 text-sm text-muted">Nothing saved yet</p>
          <p className="mt-0.5 text-xs text-muted">
            Bookmark strains from the strain page
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favorites.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-pink">
                ❤️ Favorites
              </p>
              <div className="space-y-1.5">
                {favorites.map((b) => (
                  <StrainItem key={b.id} strain={b.strain} />
                ))}
              </div>
            </div>
          )}
          {wantToTry.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sativa">
                🌿 Want to Try
              </p>
              <div className="space-y-1.5">
                {wantToTry.map((b) => (
                  <StrainItem key={b.id} strain={b.strain} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
