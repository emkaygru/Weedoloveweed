"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StrainSearchInput from "./StrainSearchInput";
import GifPicker from "./GifPicker";
import { CONSUMPTION_METHODS, FEELING_OPTIONS } from "@/lib/terpenes";

interface StrainResult {
  id?: string;
  name: string;
  type: string;
}

const MUNCHIE_SUGGESTIONS = [
  "chips", "pizza", "ice cream", "popcorn", "gummy bears",
  "mac & cheese", "cereal", "hot cheetos", "cookies", "fruit",
  "ramen", "tacos", "grilled cheese", "chocolate", "candy",
];

export default function EntryForm() {
  const router = useRouter();
  const [strain, setStrain] = useState<StrainResult | null>(null);
  const [rating, setRating] = useState(0);
  const [method, setMethod] = useState("");
  const [review, setReview] = useState("");
  const [feelings, setFeelings] = useState<string[]>([]);
  const [munchies, setMunchies] = useState<string[]>([]);
  const [munchieInput, setMunchieInput] = useState("");
  const [dispensaryName, setDispensaryName] = useState("");
  const [brand, setBrand] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleFeeling = (f: string) => {
    setFeelings((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const addMunchie = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed || munchies.includes(trimmed)) return;
    setMunchies((prev) => [...prev, trimmed]);
    setMunchieInput("");
  };

  const removeMunchie = (item: string) => {
    setMunchies((prev) => prev.filter((m) => m !== item));
  };

  const submit = async () => {
    if (!strain?.id || !rating || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strainId: strain.id,
          rating,
          method: method || null,
          review: review || null,
          feelings,
          munchies,
          dispensaryName: dispensaryName || null,
          brand: brand || null,
          gifUrl: gifUrl || null,
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
    <div className="space-y-5">
      {/* Strain */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
          What are you smoking?
        </label>
        <StrainSearchInput onSelect={setStrain} selectedStrain={strain} />
      </div>

      {/* Rating */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-3xl transition-transform active:scale-110"
            >
              {star <= rating ? "⭐" : "☆"}
            </button>
          ))}
        </div>
      </div>

      {/* Method */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
          How are you consuming?
        </label>
        <div className="flex flex-wrap gap-2">
          {CONSUMPTION_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(method === m.value ? "" : m.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                method === m.value
                  ? "bg-primary text-white"
                  : "bg-card-border/50 text-muted hover:text-foreground"
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Review */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
          Review (optional)
        </label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="How's the high? Describe the experience..."
          rows={3}
          className="w-full resize-none rounded-xl border border-card-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Feelings */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
          How do you feel?
        </label>
        <div className="flex flex-wrap gap-2">
          {FEELING_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFeeling(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                feelings.includes(f)
                  ? "bg-accent-pink text-white"
                  : "bg-card-border/50 text-muted hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Munchie Log */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
          Munchie Log 🍕 (optional)
        </label>
        {munchies.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {munchies.map((m) => (
              <span
                key={m}
                className="flex items-center gap-1 rounded-full bg-accent-yellow/20 px-2.5 py-0.5 text-xs font-medium text-accent-yellow"
              >
                {m}
                <button type="button" onClick={() => removeMunchie(m)} className="opacity-60 hover:opacity-100">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={munchieInput}
            onChange={(e) => setMunchieInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMunchie(munchieInput))}
            placeholder="What are you eating?"
            className="flex-1 rounded-xl border border-card-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => addMunchie(munchieInput)}
            disabled={!munchieInput.trim()}
            className="rounded-xl bg-accent-yellow/20 px-3 py-2 text-sm font-semibold text-accent-yellow disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {MUNCHIE_SUGGESTIONS.filter((s) => !munchies.includes(s)).slice(0, 6).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addMunchie(s)}
              className="rounded-full bg-card-border/40 px-2.5 py-0.5 text-xs text-muted hover:text-foreground"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Dispensary & Brand */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
            Dispensary
          </label>
          <input
            type="text"
            value={dispensaryName}
            onChange={(e) => setDispensaryName(e.target.value)}
            placeholder="Where from?"
            className="w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
            Brand
          </label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Brand name"
            className="w-full rounded-xl border border-card-border bg-card px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* GIF Picker */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
          Add a GIF (optional)
        </label>
        <GifPicker value={gifUrl} onChange={setGifUrl} />
      </div>

      {/* Submit */}
      <button
        onClick={submit}
        disabled={!strain?.id || !rating || submitting}
        className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-opacity disabled:opacity-40"
      >
        {submitting ? "Posting..." : "Post to Feed 🌿"}
      </button>
    </div>
  );
}
