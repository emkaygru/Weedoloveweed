"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const VERBS = [
  "smoking some",
  "absolutely torched by",
  "floating on",
  "one with the universe thanks to",
  "spiritually bonded with",
  "not okay because of",
  "vibing HARD with",
  "being humbled by",
  "losing their mind over",
  "currently transcending on",
  "having a moment with",
  "fully cooked by",
];

interface Props {
  userName: string;
}

export default function QuickPostBox({ userName }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"thought" | "madlib">("thought");
  const [text, setText] = useState("");
  const [verb, setVerb] = useState(VERBS[0]);
  const [strainInput, setStrainInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState(false);

  const firstName = userName.split(" ")[0];

  const getMadlibText = () => {
    if (!strainInput.trim()) return "";
    return `${firstName} is ${verb} ${strainInput.trim()} 🌿`;
  };

  const canSubmit =
    mode === "thought" ? text.trim().length > 0 : strainInput.trim().length > 0;

  const submit = async () => {
    if (!canSubmit || submitting) return;
    const finalText = mode === "thought" ? text.trim() : getMadlibText();
    setSubmitting(true);
    try {
      const res = await fetch("/api/thoughts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: finalText }),
      });
      if (res.ok) {
        setText("");
        setStrainInput("");
        setPosted(true);
        setTimeout(() => {
          setPosted(false);
          router.refresh();
        }, 1200);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mb-4 rounded-2xl border border-card-border bg-card p-4">
      {/* Mode toggle */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setMode("thought")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === "thought"
              ? "bg-primary text-white"
              : "bg-card-border/50 text-muted hover:text-foreground"
          }`}
        >
          💭 High Thought
        </button>
        <button
          onClick={() => setMode("madlib")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === "madlib"
              ? "bg-primary text-white"
              : "bg-card-border/50 text-muted hover:text-foreground"
          }`}
        >
          🌿 Fill in the Blank
        </button>
      </div>

      {mode === "thought" ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your high mind? 💭"
          rows={3}
          className="w-full resize-none rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      ) : (
        <div className="space-y-3">
          {/* Madlib sentence builder */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm">
            <span className="font-semibold">{firstName}</span>
            <span className="text-muted">is</span>
            <select
              value={verb}
              onChange={(e) => setVerb(e.target.value)}
              className="rounded-lg border border-card-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
            >
              {VERBS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={strainInput}
            onChange={(e) => setStrainInput(e.target.value)}
            placeholder="strain name..."
            className="w-full rounded-xl border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {getMadlibText() && (
            <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
              &ldquo;{getMadlibText()}&rdquo;
            </p>
          )}
        </div>
      )}

      {posted ? (
        <p className="mt-3 text-center text-sm font-semibold text-primary">
          Posted! ✨
        </p>
      ) : (
        <button
          onClick={submit}
          disabled={!canSubmit || submitting}
          className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-opacity disabled:opacity-40"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      )}
    </div>
  );
}
