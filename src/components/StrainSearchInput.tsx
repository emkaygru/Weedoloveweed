"use client";

import { useState, useEffect, useRef } from "react";

interface StrainResult {
  id?: string;
  name: string;
  type: string;
  external?: boolean;
  thcPercent?: number | null;
  description?: string | null;
}

interface Props {
  onSelect: (strain: StrainResult) => void;
  selectedStrain: StrainResult | null;
}

export default function StrainSearchInput({ onSelect, selectedStrain }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StrainResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newType, setNewType] = useState("hybrid");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/strains/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStrain = (strain: StrainResult) => {
    onSelect(strain);
    setQuery(strain.name);
    setShowDropdown(false);
    setShowCreate(false);
  };

  const handleCreateStrain = async () => {
    try {
      const res = await fetch("/api/strains/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: query.trim(), type: newType }),
      });
      const strain = await res.json();
      handleSelectStrain(strain);
    } catch {
      // Error creating strain
    }
  };

  if (selectedStrain) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div>
          <p className="font-semibold text-primary">{selectedStrain.name}</p>
          <p className="text-xs capitalize text-muted">{selectedStrain.type}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onSelect(null as unknown as StrainResult);
            setQuery("");
          }}
          className="text-sm text-muted hover:text-foreground"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        placeholder="Search strains..."
        className="w-full rounded-xl border border-card-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {loading && (
        <div className="absolute right-3 top-3 text-xs text-muted">...</div>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-xl border border-card-border bg-card shadow-lg">
          {results.map((strain, i) => (
            <button
              key={strain.id || `ext-${i}`}
              type="button"
              onClick={() => handleSelectStrain(strain)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-primary/5"
            >
              <span className="font-medium">{strain.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  strain.type === "indica"
                    ? "bg-indica/10 text-indica"
                    : strain.type === "sativa"
                      ? "bg-sativa/10 text-sativa"
                      : "bg-hybrid/10 text-hybrid"
                }`}
              >
                {strain.type}
              </span>
            </button>
          ))}

          {results.length === 0 && query.length >= 2 && !loading && (
            <div className="p-4 text-center text-sm text-muted">
              No strains found
            </div>
          )}

          {/* Create new strain option */}
          {query.length >= 2 && (
            <div className="border-t border-card-border p-2">
              {!showCreate ? (
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-primary hover:bg-primary/5"
                >
                  + Create &ldquo;{query}&rdquo; as new strain
                </button>
              ) : (
                <div className="space-y-2 p-2">
                  <p className="text-xs font-semibold">Type for &ldquo;{query}&rdquo;:</p>
                  <div className="flex gap-2">
                    {["indica", "sativa", "hybrid"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewType(t)}
                        className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                          newType === t
                            ? t === "indica"
                              ? "bg-indica text-white"
                              : t === "sativa"
                                ? "bg-sativa text-white"
                                : "bg-hybrid text-white"
                            : "bg-card-border text-muted"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateStrain}
                    className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white"
                  >
                    Create Strain
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
