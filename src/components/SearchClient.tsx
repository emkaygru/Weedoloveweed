"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TERPENE_INFO } from "@/lib/terpenes";

const STRAIN_TYPES = ["indica", "sativa", "hybrid"] as const;
type StrainType = (typeof STRAIN_TYPES)[number];

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

  // Add new strain inline
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStrainName, setNewStrainName] = useState("");
  const [newStrainType, setNewStrainType] = useState<StrainType>("hybrid");
  const [addingStrain, setAddingStrain] = useState(false);

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

  // Ensure a strain exists in the DB (create from built-in data if needed)
  const ensureStrainInDb = async (strain: StrainResult): Promise<StrainResult> => {
    if (strain.id) return strain;
    const res = await fetch("/api/strains/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: strain.name,
        type: strain.type,
        description: strain.description,
        thcPercent: strain.thcPercent,
        cbdPercent: strain.cbdPercent,
        effects: strain.effects,
        flavors: strain.flavors,
        terpeneProfile: strain.terpeneProfile,
      }),
    });
    const created = await res.json();
    const saved = { ...strain, id: created.id, slug: created.slug };
    setSelectedStrain(saved);
    return saved;
  };

  const addToTryList = async (strain: StrainResult) => {
    if (bookmarking) return;
    setBookmarking(true);
    try {
      const s = await ensureStrainInDb(strain);
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strainId: s.id, listType: "want_to_try" }),
      });
      alert(`Added "${s.name}" to your try list!`);
    } catch {
      // Error
    } finally {
      setBookmarking(false);
    }
  };

  const addToFavorites = async (strain: StrainResult) => {
    if (bookmarking) return;
    setBookmarking(true);
    try {
      const s = await ensureStrainInDb(strain);
      await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strainId: s.id, listType: "favorites" }),
      });
      alert(`Added "${s.name}" to favorites!`);
    } catch {
      // Error
    } finally {
      setBookmarking(false);
    }
  };

  const addNewStrain = async () => {
    if (!newStrainName.trim() || addingStrain) return;
    setAddingStrain(true);
    try {
      const res = await fetch("/api/strains/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStrainName.trim(), type: newStrainType }),
      });
      const created = await res.json();
      if (created.id) {
        setSelectedStrain(created);
        setShowAddForm(false);
        setNewStrainName("");
        setQuery(created.name);
      }
    } catch {
      // error
    } finally {
      setAddingStrain(false);
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
              disabled={bookmarking}
              className="flex-1 rounded-xl bg-sativa py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              📋 Want to Try
            </button>
            <button
              onClick={() => addToFavorites(selectedStrain)}
              disabled={bookmarking}
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

      {/* Empty state — no results */}
      {!loading && query.length >= 2 && results.length === 0 && !selectedStrain && (
        <div className="mt-6 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-2 text-sm text-muted">
            No strains found for &ldquo;{query}&rdquo;
          </p>
          <button
            onClick={() => {
              setNewStrainName(query);
              setShowAddForm(true);
            }}
            className="mt-3 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
          >
            + Add &ldquo;{query}&rdquo; to the database
          </button>
        </div>
      )}

      {/* Hint when empty + Add a New Strain card */}
      {query.length < 2 && !selectedStrain && (
        <div className="mt-6 space-y-4">
          <div className="text-center">
            <p className="text-4xl">🌿</p>
            <p className="mt-2 text-sm text-muted">
              Search for any strain to see details, terpene profiles, and more
            </p>
          </div>

          {/* Add a new strain */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex w-full items-center justify-between rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3.5 text-left transition-colors hover:border-primary/70 hover:bg-primary/10"
            >
              <div>
                <p className="text-sm font-semibold text-primary">Add a New Strain</p>
                <p className="text-xs text-muted">
                  Can&apos;t find what you&apos;re looking for? Add it yourself.
                </p>
              </div>
              <span className="text-2xl text-primary">+</span>
            </button>
          ) : null}
        </div>
      )}

      {/* Add a new strain inline form */}
      {showAddForm && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Add a New Strain</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          <input
            type="text"
            value={newStrainName}
            onChange={(e) => setNewStrainName(e.target.value)}
            placeholder="Strain name..."
            className="w-full rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            autoFocus
          />
          <div className="mt-3 flex gap-2">
            {STRAIN_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setNewStrainType(t)}
                className={`flex-1 rounded-xl py-2 text-xs font-semibold capitalize transition-colors ${
                  newStrainType === t
                    ? t === "indica"
                      ? "bg-indica text-white"
                      : t === "sativa"
                        ? "bg-sativa text-white"
                        : "bg-hybrid text-white"
                    : "bg-card-border/50 text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={addNewStrain}
            disabled={!newStrainName.trim() || addingStrain}
            className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white disabled:opacity-40"
          >
            {addingStrain ? "Adding..." : "Add Strain"}
          </button>
        </div>
      )}
    </div>
  );
}
