"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StrainSearchInput from "./StrainSearchInput";

interface StrainResult {
  id?: string;
  name: string;
  type: string;
}

export default function ThoughtForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [strain, setStrain] = useState<StrainResult | null>(null);
  const [gifUrl, setGifUrl] = useState("");
  const [showStrainSearch, setShowStrainSearch] = useState(false);
  const [showGifInput, setShowGifInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/thoughts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          strainId: strain?.id || null,
          gifUrl: gifUrl?.trim() || null,
        }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch {
      // Error
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main text input */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind? 💭"
        rows={4}
        autoFocus
        className="w-full resize-none rounded-xl border border-card-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
      />

      {/* Optional strain tag */}
      {showStrainSearch && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
            Currently smoking (optional)
          </label>
          <StrainSearchInput onSelect={setStrain} selectedStrain={strain} />
        </div>
      )}

      {/* Optional GIF */}
      {showGifInput && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
            Add a GIF
          </label>
          <input
            type="url"
            value={gifUrl}
            onChange={(e) => setGifUrl(e.target.value)}
            placeholder="Paste a GIF URL..."
            className="w-full rounded-xl border border-card-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
          />
          {gifUrl && (
            <img
              src={gifUrl}
              alt="Preview"
              className="mt-2 max-h-40 rounded-xl"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
      )}

      {/* Toggle buttons */}
      <div className="flex gap-2">
        {!showStrainSearch && (
          <button
            type="button"
            onClick={() => setShowStrainSearch(true)}
            className="rounded-full bg-card-border/50 px-3 py-1.5 text-xs text-muted hover:text-foreground"
          >
            🌿 Tag strain
          </button>
        )}
        {!showGifInput && (
          <button
            type="button"
            onClick={() => setShowGifInput(true)}
            className="rounded-full bg-card-border/50 px-3 py-1.5 text-xs text-muted hover:text-foreground"
          >
            🎬 Add GIF
          </button>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        disabled={!text.trim() || submitting}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-opacity disabled:opacity-40"
      >
        {submitting ? "Posting..." : "Share Thought 💭"}
      </button>
    </div>
  );
}
