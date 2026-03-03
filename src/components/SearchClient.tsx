"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TERPENE_INFO } from "@/lib/terpenes";

interface StrainResult {
  id?: string;
  name: string;
  slug?: string;
  type: string;
  description?: string | null;
  thcPercent?: number | null;
  cbdPercent?: number | null;
  effects?: string[] | null;
  flavors?: string[] | null;
  terpeneProfile?: Record<string, number> | null;
  imageUrl?: string | null;
  external?: boolean;
  apiSourceId?: string | null;
}

export default function SearchClient({ userId }: { userId: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StrainResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStrain, setSelectedStrain] = useState<StrainResult | null>(null);
  const [bookmarking, setBookmarking] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/strains/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  const addToTryList = async (strain: StrainResult) => {
    if (!strain.id || bookmarking) return;
    setBookmarking(true);
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strainId: strain.id, listType: "want_to_try" }),
      });
      alert(`Added "${strain.name}" to your try list!`);
    } catch {
      // Error
    } finally {
      setBookmarking(false);
    }
  };

  const addToFavorites = async (strain: StrainResult) => {
    if (!strain.id || bookmarking) return;
    setBookmarking(true);
    try {
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strainId: strain.id, listType: "favorites" }),
      });
      alert(`Added "${strain.name}" to favorites!`);
    } catch {
      // Error
    } finally {
      setBookmarking(false);
    }
  };

  // Get top terpenes with explanations
  const getTopTerpenes = (terpenes: Record<string, number> | null | undefined) => {
    if (!terpenes) return [];
    return Object.entries(terpenes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => ({
        name,
        value,
        info: TERPENE_INFO[name.toLowerCase()] || TERPENE_INFO[name.toLowerCase().replace(/[_-]/g, "")] || null,
      }));
  };

  return (
    <div>
      {/* Search input */}
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setSelectedStrain(null);
        }}
        placeholder="Search by name (e.g., Blue Dream, OG Kush)..."
        className="w-full rounded-xl border border-card-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        autoFocus
      />

      {loading && (
        <p className="mt-4 text-center text-sm text-muted">Searching...</p>
      )}

      {/* Selected strain detail */}
      {selectedStrain && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{selectedStrain.name}</h2>
              <span
                className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize text-white ${
                  selectedStrain.type === "indica"
                    ? "bg-indica"
                    : selectedStrain.type === "sativa"
                      ? "bg-sativa"
                      : "bg-hybrid"
                }`}
              >
                {selectedStrain.type}
              </span>
            </div>
            {selectedStrain.imageUrl && (
              <img
                src={selectedStrain.imageUrl}
                alt={selectedStrain.name}
                className="h-16 w-16 rounded-xl object-cover"
              />
            )}
          </div>

          {/* THC / CBD */}
          {(selectedStrain.thcPercent || selectedStrain.cbdPercent) && (
            <div className="mt-3 flex gap-3">
              {selectedStrain.thcPercent && (
                <div className="rounded-lg bg-primary/10 px-3 py-1.5">
                  <span className="text-xs text-muted">THC</span>
                  <p className="font-bold text-primary">
                    {selectedStrain.thcPercent.toFixed(1)}%
                  </p>
                </div>
              )}
              {selectedStrain.cbdPercent && (
                <div className="rounded-lg bg-indica/10 px-3 py-1.5">
                  <span className="text-xs text-muted">CBD</span>
                  <p className="font-bold text-indica">
                    {selectedStrain.cbdPercent.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedStrain.description && (
            <p className="mt-3 text-sm text-muted">{selectedStrain.description}</p>
          )}

          {/* Effects */}
          {selectedStrain.effects && selectedStrain.effects.length > 0 && (
            <div className="mt-3">
              <h3 className="text-xs font-semibold uppercase text-muted">Effects</h3>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {selectedStrain.effects.map((e) => (
                  <span
                    key={e}
                    className="rounded-full bg-sativa/10 px-2.5 py-0.5 text-xs font-medium text-sativa"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Terpene explainer */}
          {selectedStrain.terpeneProfile && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase text-muted">
                Top Terpenes
              </h3>
              <div className="mt-2 space-y-3">
                {getTopTerpenes(selectedStrain.terpeneProfile).map((t) => (
                  <div
                    key={t.name}
                    className="rounded-xl bg-primary/5 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold capitalize">
                        {t.info?.emoji || "🌱"} {t.name}
                      </span>
                      <span className="text-xs text-muted">
                        {(t.value * 100).toFixed(1)}%
                      </span>
                    </div>
                    {t.info && (
                      <>
                        <p className="mt-1 text-xs text-muted">
                          {t.info.description}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-primary">
                          {t.info.effects}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => addToTryList(selectedStrain)}
              disabled={bookmarking || !selectedStrain.id}
              className="flex-1 rounded-xl bg-sativa py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              📋 Want to Try
            </button>
            <button
              onClick={() => addToFavorites(selectedStrain)}
              disabled={bookmarking || !selectedStrain.id}
              className="flex-1 rounded-xl bg-accent-pink py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              ❤️ Favorite
            </button>
          </div>

          {selectedStrain.id && (
            <Link
              href={`/strain/${selectedStrain.id}`}
              className="mt-2 block text-center text-xs text-primary hover:underline"
            >
              View full strain details →
            </Link>
          )}
        </div>
      )}

      {/* Search results */}
      {!selectedStrain && results.length > 0 && (
        <div className="mt-3 space-y-2">
          {results.map((strain, i) => (
            <button
              key={strain.id || `ext-${i}`}
              onClick={() => setSelectedStrain(strain)}
              className="flex w-full items-center justify-between rounded-xl border border-card-border bg-card p-3 text-left transition-colors hover:border-primary/30"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{strain.name}</p>
                {strain.description && (
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {strain.description}
                  </p>
                )}
              </div>
              <div className="ml-3 flex items-center gap-2">
                {strain.thcPercent && (
                  <span className="text-xs text-muted">
                    THC {strain.thcPercent.toFixed(0)}%
                  </span>
                )}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize text-white ${
                    strain.type === "indica"
                      ? "bg-indica"
                      : strain.type === "sativa"
                        ? "bg-sativa"
                        : "bg-hybrid"
                  }`}
                >
                  {strain.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && query.length >= 2 && results.length === 0 && !selectedStrain && (
        <div className="mt-8 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-2 text-sm text-muted">
            No strains found for &ldquo;{query}&rdquo;
          </p>
          <p className="mt-1 text-xs text-muted">
            Try a different name or create a new strain when logging
          </p>
        </div>
      )}

      {/* Hint when empty */}
      {query.length < 2 && !selectedStrain && (
        <div className="mt-8 text-center">
          <p className="text-4xl">🌿</p>
          <p className="mt-2 text-sm text-muted">
            Search for any strain to see details, terpene profiles, and more
          </p>
        </div>
      )}
    </div>
  );
}
