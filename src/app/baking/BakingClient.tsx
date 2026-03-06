"use client";

import { useState, useEffect, useCallback } from "react";

type Recipe = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  ingredients: string[];
  instructions: string[];
  servings: number | null;
  mgThcTotal: number | null;
  notes: string | null;
  isBuiltIn: boolean;
  authorId: string | null;
  saved: boolean;
};

const CATEGORIES = ["all", "edible", "topical", "tincture", "capsule", "other"] as const;
const CATEGORY_ICONS: Record<string, string> = {
  all: "🌿",
  edible: "🍪",
  topical: "🧴",
  tincture: "💧",
  capsule: "💊",
  other: "✨",
};

type View = "list" | "detail" | "add" | "instructions";

export default function BakingClient() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);

  // Add form state
  const [form, setForm] = useState({
    title: "",
    category: "edible",
    description: "",
    ingredients: [""],
    instructions: [""],
    servings: "",
    mgThcTotal: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "all") params.set("category", category);
    const res = await fetch(`/api/recipes?${params}`);
    if (res.ok) setRecipes(await res.json());
    setLoading(false);
  }, [search, category]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  async function toggleSave(recipe: Recipe, e: React.MouseEvent) {
    e.stopPropagation();
    const res = await fetch(`/api/recipes/${recipe.id}/save`, { method: "POST" });
    if (res.ok) {
      const { saved } = await res.json();
      setRecipes((rs) => rs.map((r) => (r.id === recipe.id ? { ...r, saved } : r)));
      if (selected?.id === recipe.id) setSelected((s) => s && { ...s, saved });
    }
  }

  function copyIngredients(recipe: Recipe) {
    const text = `${recipe.title}\n\nIngredients:\n${recipe.ingredients.map((i, n) => `${n + 1}. ${i}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function submitRecipe(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      ingredients: form.ingredients.filter(Boolean),
      instructions: form.instructions.filter(Boolean),
    };
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setView("list");
      setForm({
        title: "", category: "edible", description: "",
        ingredients: [""], instructions: [""],
        servings: "", mgThcTotal: "", notes: "",
      });
      fetchRecipes();
    }
    setSaving(false);
  }

  function updateList(
    field: "ingredients" | "instructions",
    idx: number,
    value: string
  ) {
    setForm((f) => {
      const arr = [...f[field]];
      arr[idx] = value;
      return { ...f, [field]: arr };
    });
  }

  function addListItem(field: "ingredients" | "instructions") {
    setForm((f) => ({ ...f, [field]: [...f[field], ""] }));
  }

  function removeListItem(field: "ingredients" | "instructions", idx: number) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  }

  // ── Step-through instructions view ──
  if (view === "instructions" && selected) {
    const steps = selected.instructions;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("detail")} className="text-sm text-muted hover:text-foreground">
            ← Back
          </button>
          <h2 className="font-bold">{selected.title}</h2>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs text-muted">
              Step {step + 1} of {steps.length}
            </span>
            <div className="h-1.5 flex-1 mx-3 rounded-full bg-card-border overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-base leading-relaxed">{steps[step]}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex-1 rounded-xl border border-card-border bg-card py-3 font-medium disabled:opacity-40"
          >
            ← Prev
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex-1 rounded-xl bg-primary py-3 font-medium text-white"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => { setStep(0); setView("detail"); }}
              className="flex-1 rounded-xl bg-primary py-3 font-medium text-white"
            >
              Done ✓
            </button>
          )}
        </div>
        {selected.notes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            📝 {selected.notes}
          </div>
        )}
      </div>
    );
  }

  // ── Recipe detail view ──
  if (view === "detail" && selected) {
    return (
      <div className="space-y-4 pb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className="text-sm text-muted hover:text-foreground">
            ← Back
          </button>
        </div>

        <div className="rounded-xl border border-card-border bg-card p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs text-muted uppercase tracking-wide">
                {CATEGORY_ICONS[selected.category]} {selected.category}
              </span>
              <h2 className="text-xl font-bold">{selected.title}</h2>
            </div>
            <button
              onClick={(e) => toggleSave(selected, e)}
              className="text-xl"
              title={selected.saved ? "Unsave" : "Save"}
            >
              {selected.saved ? "🔖" : "🏷️"}
            </button>
          </div>

          {selected.description && (
            <p className="text-sm text-muted">{selected.description}</p>
          )}

          <div className="flex gap-3 text-xs text-muted">
            {selected.servings && <span>🍽️ {selected.servings} servings</span>}
            {selected.mgThcTotal && <span>💚 ~{selected.mgThcTotal}mg THC total</span>}
            {selected.servings && selected.mgThcTotal && (
              <span>= ~{(selected.mgThcTotal / selected.servings).toFixed(1)}mg/serving</span>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div className="rounded-xl border border-card-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Ingredients</h3>
            <button
              onClick={() => copyIngredients(selected)}
              className="text-xs text-primary hover:underline"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
          <ul className="space-y-1.5">
            {selected.ingredients.map((ing, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="text-muted">•</span>
                <span>{ing}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="rounded-xl border border-card-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Instructions</h3>
            <button
              onClick={() => { setStep(0); setView("instructions"); }}
              className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
            >
              Follow steps →
            </button>
          </div>
          <ol className="space-y-2">
            {selected.instructions.map((inst, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 font-bold text-primary">{i + 1}.</span>
                <span>{inst}</span>
              </li>
            ))}
          </ol>
        </div>

        {selected.notes && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            📝 Notes: {selected.notes}
          </div>
        )}
      </div>
    );
  }

  // ── Add recipe form ──
  if (view === "add") {
    return (
      <form onSubmit={submitRecipe} className="space-y-4 pb-8">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setView("list")} className="text-sm text-muted hover:text-foreground">
            ← Back
          </button>
          <h2 className="font-bold">Add Recipe</h2>
        </div>

        <input
          required
          placeholder="Recipe title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm"
        />

        <select
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          className="w-full rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm"
        >
          {["edible", "topical", "tincture", "capsule", "other"].map((c) => (
            <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
          ))}
        </select>

        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={2}
          className="w-full rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm"
        />

        {/* Ingredients */}
        <div>
          <label className="mb-2 block text-sm font-semibold">Ingredients</label>
          <div className="space-y-2">
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2">
                <input
                  placeholder={`Ingredient ${i + 1}`}
                  value={ing}
                  onChange={(e) => updateList("ingredients", i, e.target.value)}
                  className="flex-1 rounded-xl border border-card-border bg-card px-3 py-2 text-sm"
                />
                {form.ingredients.length > 1 && (
                  <button type="button" onClick={() => removeListItem("ingredients", i)}
                    className="text-red-400 hover:text-red-600 px-2">✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addListItem("ingredients")}
            className="mt-2 text-xs text-primary hover:underline">+ Add ingredient</button>
        </div>

        {/* Instructions */}
        <div>
          <label className="mb-2 block text-sm font-semibold">Instructions</label>
          <div className="space-y-2">
            {form.instructions.map((inst, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-shrink-0 pt-2.5 text-sm font-bold text-primary w-5">{i + 1}.</div>
                <textarea
                  placeholder={`Step ${i + 1}`}
                  value={inst}
                  onChange={(e) => updateList("instructions", i, e.target.value)}
                  rows={2}
                  className="flex-1 rounded-xl border border-card-border bg-card px-3 py-2 text-sm"
                />
                {form.instructions.length > 1 && (
                  <button type="button" onClick={() => removeListItem("instructions", i)}
                    className="text-red-400 hover:text-red-600 px-2">✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addListItem("instructions")}
            className="mt-2 text-xs text-primary hover:underline">+ Add step</button>
        </div>

        {/* Optional fields */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted">Servings</label>
            <input type="number" placeholder="e.g. 12"
              value={form.servings}
              onChange={(e) => setForm((f) => ({ ...f, servings: e.target.value }))}
              className="w-full rounded-xl border border-card-border bg-card px-3 py-2 text-sm" />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-muted">Total mg THC</label>
            <input type="number" placeholder="e.g. 200"
              value={form.mgThcTotal}
              onChange={(e) => setForm((f) => ({ ...f, mgThcTotal: e.target.value }))}
              className="w-full rounded-xl border border-card-border bg-card px-3 py-2 text-sm" />
          </div>
        </div>

        <textarea placeholder="Notes (optional)" value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={2}
          className="w-full rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm" />

        <button type="submit" disabled={saving}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60">
          {saving ? "Saving…" : "Save Recipe"}
        </button>
      </form>
    );
  }

  // ── Recipe list view ──
  return (
    <div className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🧁 Baking</h1>
        <button
          onClick={() => setView("add")}
          className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white"
        >
          + Add
        </button>
      </div>

      <input
        type="search"
        placeholder="Search recipes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm"
      />

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === c
                ? "bg-primary text-white"
                : "border border-card-border bg-card text-muted hover:text-foreground"
            }`}
          >
            {CATEGORY_ICONS[c]} {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-10 text-center text-muted text-sm">Loading…</div>
      ) : recipes.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-card p-8 text-center text-muted text-sm">
          No recipes yet. Add one! 🌿
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              onClick={() => { setSelected(recipe); setView("detail"); }}
              className="rounded-xl border border-card-border bg-card p-4 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs text-muted">
                      {CATEGORY_ICONS[recipe.category]} {recipe.category}
                    </span>
                    {recipe.isBuiltIn && (
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary font-medium">
                        built-in
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold leading-tight">{recipe.title}</h3>
                  {recipe.description && (
                    <p className="mt-0.5 text-xs text-muted line-clamp-2">{recipe.description}</p>
                  )}
                  <div className="mt-1.5 flex gap-3 text-xs text-muted">
                    {recipe.servings && <span>🍽️ {recipe.servings} servings</span>}
                    {recipe.mgThcTotal && <span>💚 {recipe.mgThcTotal}mg THC</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => toggleSave(recipe, e)}
                  className="flex-shrink-0 text-lg"
                  title={recipe.saved ? "Unsave" : "Save"}
                >
                  {recipe.saved ? "🔖" : "🏷️"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
