"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TBreak {
  id: string;
  startedAt: string;
  endedAt: string | null;
  goalDays: number | null;
}

function daysBetween(start: string, end?: string | null): number {
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  return Math.floor((e - s) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TBreakPage() {
  const [active, setActive] = useState<TBreak | null>(null);
  const [history, setHistory] = useState<TBreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalDays, setGoalDays] = useState("");
  const [acting, setActing] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetch("/api/tbreak")
      .then((r) => r.json())
      .then((d) => {
        setActive(d.active || null);
        setHistory(d.history || []);
      })
      .finally(() => setLoading(false));
  }, []);

  // Tick every minute to update the live counter
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const startBreak = async () => {
    if (acting) return;
    setActing(true);
    try {
      const res = await fetch("/api/tbreak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalDays: goalDays ? Number(goalDays) : null }),
      });
      const data = await res.json();
      setActive(data);
      setHistory([]);
      // Re-fetch history
      fetch("/api/tbreak")
        .then((r) => r.json())
        .then((d) => setHistory(d.history || []));
    } finally {
      setActing(false);
    }
  };

  const endBreak = async () => {
    if (acting) return;
    setActing(true);
    try {
      await fetch("/api/tbreak", { method: "PATCH" });
      setHistory((prev) => active ? [{ ...active, endedAt: new Date().toISOString() }, ...prev] : prev);
      setActive(null);
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  const activeDays = active ? Math.floor((now - new Date(active.startedAt).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const activeHours = active ? Math.floor(((now - new Date(active.startedAt).getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) : 0;
  const progress = active?.goalDays ? Math.min((activeDays / active.goalDays) * 100, 100) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-muted hover:text-foreground">
          ←
        </Link>
        <h1 className="text-xl font-extrabold">T-Break Tracker 🧘</h1>
      </div>

      {active ? (
        /* Active break */
        <div className="rounded-2xl border border-primary/30 bg-card p-5">
          <div className="text-center">
            <p className="text-5xl font-extrabold text-primary">{activeDays}</p>
            <p className="text-sm font-semibold text-muted">
              day{activeDays !== 1 ? "s" : ""} {activeHours}h clean 🌱
            </p>
            <p className="mt-1 text-xs text-muted">
              Started {formatDate(active.startedAt)}
            </p>
          </div>

          {progress !== null && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Goal: {active.goalDays} days</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-3 rounded-full bg-card-border overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {progress >= 100 && (
                <p className="mt-2 text-center text-sm font-bold text-primary">
                  🎉 Goal reached! You did it!
                </p>
              )}
            </div>
          )}

          <div className="mt-5 space-y-2 text-center">
            <p className="text-xs text-muted">
              Tolerance resets after ~{activeDays >= 21 ? "✅ 21+" : "21"} days
            </p>
            <button
              onClick={endBreak}
              disabled={acting}
              className="w-full rounded-xl border border-card-border bg-card-border/40 py-3 text-sm font-semibold text-muted transition-colors hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
            >
              {acting ? "Ending..." : "End Break 🌿"}
            </button>
          </div>
        </div>
      ) : (
        /* Start a break */
        <div className="rounded-2xl border border-card-border bg-card p-5">
          <p className="text-4xl text-center">🧘</p>
          <h2 className="mt-3 text-center text-lg font-bold">Start a T-Break</h2>
          <p className="mt-1 text-center text-sm text-muted">
            Give your tolerance a reset. Track your streak.
          </p>

          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold uppercase text-muted">
              Goal (optional)
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={goalDays}
                onChange={(e) => setGoalDays(e.target.value)}
                placeholder="e.g. 21"
                min="1"
                className="w-24 rounded-xl border border-card-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
              <span className="text-sm text-muted">days</span>
            </div>
            <div className="mt-2 flex gap-2">
              {[7, 14, 21, 30].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setGoalDays(String(d))}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    goalDays === String(d)
                      ? "bg-primary text-white"
                      : "bg-card-border/50 text-muted hover:text-foreground"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startBreak}
            disabled={acting}
            className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white disabled:opacity-40"
          >
            {acting ? "Starting..." : "Start Break 🧘"}
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-bold uppercase text-muted">Past Breaks</h2>
          <div className="space-y-2">
            {history.map((b) => {
              const days = daysBetween(b.startedAt, b.endedAt);
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-card-border bg-card px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{days} day{days !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-muted">
                      {formatDate(b.startedAt)} → {b.endedAt ? formatDate(b.endedAt) : "ongoing"}
                    </p>
                  </div>
                  {b.goalDays && (
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        days >= b.goalDays
                          ? "bg-primary/20 text-primary"
                          : "bg-card-border/50 text-muted"
                      }`}
                    >
                      {days >= b.goalDays ? "✅ Goal" : `${days}/${b.goalDays}d`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="rounded-2xl bg-primary/5 p-4 space-y-2">
        <h3 className="text-xs font-bold uppercase text-muted">T-Break Tips 💡</h3>
        <ul className="space-y-1 text-xs text-muted">
          <li>• 48–72 hours: CB1 receptors start recovering</li>
          <li>• 7 days: noticeable tolerance reduction</li>
          <li>• 21 days: significant reset for most users</li>
          <li>• Exercise, hydration, and sleep speed recovery</li>
        </ul>
      </div>
    </div>
  );
}
