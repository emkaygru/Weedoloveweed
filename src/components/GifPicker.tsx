"use client";

import { useState, useRef } from "react";

interface GifResult {
  id: string;
  title: string;
  images: {
    fixed_height_small: { url: string };
    fixed_height: { url: string };
  };
}

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export default function GifPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GifResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const search = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/giphy/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const select = (gif: GifResult) => {
    onChange(gif.images.fixed_height.url);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const clear = () => {
    onChange("");
    setOpen(false);
  };

  if (value) {
    return (
      <div className="relative">
        <img
          src={value}
          alt="Selected GIF"
          className="max-h-40 w-full rounded-xl object-cover"
        />
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white hover:bg-black/80"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full bg-card-border/50 px-3 py-1.5 text-xs text-muted hover:text-foreground"
        >
          🎬 Add GIF
        </button>
      ) : (
        <div className="rounded-xl border border-card-border bg-card p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => search(e.target.value)}
              placeholder="Search Giphy..."
              autoFocus
              className="flex-1 rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>

          {loading && (
            <p className="mt-2 text-center text-xs text-muted">Searching...</p>
          )}

          {results.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
              {results.map((gif) => (
                <button
                  key={gif.id}
                  type="button"
                  onClick={() => select(gif)}
                  className="overflow-hidden rounded-lg"
                >
                  <img
                    src={gif.images.fixed_height_small.url}
                    alt={gif.title}
                    className="h-20 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <p className="mt-2 text-center text-xs text-muted">No GIFs found</p>
          )}
        </div>
      )}
    </div>
  );
}
