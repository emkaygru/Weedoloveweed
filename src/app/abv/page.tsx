"use client";

import { useState } from "react";

type IngredientRow = {
  id: number;
  label: string;
  grams: string;
  thcPercent: string;
  type: "abv" | "oil" | "flower";
};

const TYPE_LABELS = {
  abv: "ABV (Already Been Vaped)",
  flower: "Fresh Flower / Kief",
  oil: "Oil / Concentrate / Distillate",
};

// ABV retains ~20-30% of original THC after vaping; use 25% as default
const ABV_RETENTION = 0.25;
// Decarboxylation efficiency for edibles (~95% conversion, then ~60-80% bioavailability)
const DECARB_EFFICIENCY = 0.95;
// Edible bioavailability factor range
const BIO_LOW = 0.4;
const BIO_HIGH = 0.7;

let nextId = 3;

export default function ABVPage() {
  const [rows, setRows] = useState<IngredientRow[]>([
    { id: 1, label: "My ABV", grams: "", thcPercent: "3", type: "abv" },
    { id: 2, label: "RSO / Oil", grams: "", thcPercent: "60", type: "oil" },
  ]);
  const [servings, setServings] = useState("10");
  const [butterGrams, setButterGrams] = useState("");

  function addRow(type: IngredientRow["type"]) {
    const defaults = { abv: "3", flower: "20", oil: "60" };
    setRows((r) => [
      ...r,
      { id: nextId++, label: "", grams: "", thcPercent: defaults[type], type },
    ]);
  }

  function updateRow(id: number, field: keyof IngredientRow, value: string) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function removeRow(id: number) {
    setRows((r) => r.filter((row) => row.id !== id));
  }

  // Calculate total mg THC in the batch
  const totalMgThc = rows.reduce((sum, row) => {
    const g = parseFloat(row.grams) || 0;
    const pct = parseFloat(row.thcPercent) || 0;
    // grams → mg (*1000), then × THC% / 100
    const rawMg = g * 1000 * (pct / 100);
    // ABV has already been decarbed; oil/concentrate may need decarb
    const mgAfterDecarb = row.type === "abv" ? rawMg * ABV_RETENTION : rawMg * DECARB_EFFICIENCY;
    return sum + mgAfterDecarb;
  }, 0);

  const numServings = parseInt(servings) || 1;
  const mgPerServingLow = (totalMgThc * BIO_LOW) / numServings;
  const mgPerServingHigh = (totalMgThc * BIO_HIGH) / numServings;
  const mgPerServingRaw = totalMgThc / numServings;

  const concentrationNote =
    butterGrams && parseFloat(butterGrams) > 0
      ? `~${((totalMgThc * DECARB_EFFICIENCY) / parseFloat(butterGrams)).toFixed(1)} mg/g in your butter/oil`
      : null;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">🧮 ABV Calculator</h1>
        <p className="mt-1 text-sm text-muted">
          Estimate the THC dose in your infusion from ABV, flower, or concentrates.
        </p>
      </div>

      {/* Ingredient rows */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-card-border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted uppercase tracking-wide">
                {TYPE_LABELS[row.type]}
              </span>
              {rows.length > 1 && (
                <button
                  onClick={() => removeRow(row.id)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  remove
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Label (optional)"
              value={row.label}
              onChange={(e) => updateRow(row.id, "label", e.target.value)}
              className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm"
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted">Grams</label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 5"
                  value={row.grams}
                  onChange={(e) => updateRow(row.id, "grams", e.target.value)}
                  className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-muted">
                  {row.type === "abv" ? "Original THC % (before vaping)" : "THC %"}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="%"
                  value={row.thcPercent}
                  onChange={(e) => updateRow(row.id, "thcPercent", e.target.value)}
                  className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add ingredient buttons */}
      <div className="flex flex-wrap gap-2">
        {(["abv", "flower", "oil"] as const).map((type) => (
          <button
            key={type}
            onClick={() => addRow(type)}
            className="rounded-full border border-card-border bg-card px-3 py-1.5 text-xs font-medium hover:border-primary hover:text-primary transition-colors"
          >
            + {type === "abv" ? "ABV" : type === "flower" ? "Flower / Kief" : "Oil / Concentrate"}
          </button>
        ))}
      </div>

      {/* Serving & butter inputs */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted">Number of servings</label>
          <input
            type="number"
            inputMode="numeric"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted">
            Total butter / oil grams <span className="text-muted">(optional)</span>
          </label>
          <input
            type="number"
            inputMode="decimal"
            placeholder="e.g. 227"
            value={butterGrams}
            onChange={(e) => setButterGrams(e.target.value)}
            className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Results */}
      {totalMgThc > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <h2 className="font-bold text-primary">Estimated Results</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card border border-card-border p-3 text-center">
              <div className="text-2xl font-extrabold text-foreground">
                {totalMgThc.toFixed(0)}
              </div>
              <div className="text-xs text-muted">mg THC in batch</div>
            </div>
            <div className="rounded-lg bg-card border border-card-border p-3 text-center">
              <div className="text-2xl font-extrabold text-foreground">
                {mgPerServingRaw.toFixed(1)}
              </div>
              <div className="text-xs text-muted">mg THC per serving (raw)</div>
            </div>
          </div>

          <div className="rounded-lg bg-card border border-card-border p-3 text-center">
            <div className="text-lg font-bold text-foreground">
              {mgPerServingLow.toFixed(1)} – {mgPerServingHigh.toFixed(1)} mg
            </div>
            <div className="text-xs text-muted">
              estimated absorbed per serving (40–70% bioavailability)
            </div>
          </div>

          {concentrationNote && (
            <div className="text-center text-sm text-muted">{concentrationNote}</div>
          )}

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
            <p className="font-semibold">⚠️ How this is calculated</p>
            <p>ABV retains ~25% of original THC after vaping. Flower/oil gets 95% decarb efficiency. Edible bioavailability is typically 40–70% depending on your metabolism, fat content, and tolerance. Start low!</p>
          </div>
        </div>
      )}

      {totalMgThc === 0 && (
        <div className="rounded-xl border border-card-border bg-card p-6 text-center text-muted text-sm">
          Enter your ingredients above to see estimated dosing 🌿
        </div>
      )}
    </div>
  );
}
