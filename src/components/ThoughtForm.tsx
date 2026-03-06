"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StrainSearchInput from "./StrainSearchInput";
import GifPicker from "./GifPicker";

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
  const [anonymous, setAnonymous] = useState(false);
  const [showStrainSearch, setShowStrainSearch] = useState(false);
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
          gifUrl: gifUrl || null,
          anonymous,
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
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's on your mind? 💭"
        rows={4}
        autoFocus
        className="w-full resize-none rounded-xl border border-card-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
      />

      {showStrainSearch && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
            Currently smoking (optional)
          </label>
          <StrainSearchInput onSelect={setStrain} selectedStrain={strain} />
        </div>
      )}

      <GifPicker value={gifUrl} onChange={setGifUrl} />

      <div className="flex flex-wrap items-center gap-2">
        {!showStrainSearch && (
          <button
            type="button"
            onClick={() => setShowStrainSearch(true)}
            className="rounded-full bg-card-border/50 px-3 py-1.5 text-xs text-muted hover:text-foreground"
          >
            🌿 Tag strain
          </button>
        )}
        <button
          type="button"
          onClick={() => setAnonymous((v) => !v)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            anonymous
              ? "bg-primary/20 text-primary"
              : "bg-card-border/50 text-muted hover:text-foreground"
          }`}
        >
          {anonymous ? "👁️ Anonymous" : "👤 Post as you"}
        </button>
      </div>

      {anonymous && (
        <p className="text-xs text-muted">
          You&apos;ll appear as &ldquo;A mysterious stoner 👁️&rdquo;.
        </p>
      )}

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
