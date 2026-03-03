import { CONSUMPTION_METHODS } from "@/lib/terpenes";

export default function MethodBadge({ method }: { method: string }) {
  const info = CONSUMPTION_METHODS.find((m) => m.value === method);
  if (!info) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      <span>{info.emoji}</span>
      <span>{info.label}</span>
    </span>
  );
}
