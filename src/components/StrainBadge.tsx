const typeStyles: Record<string, string> = {
  indica: "bg-indica/15 text-indica border-indica/30",
  sativa: "bg-sativa/15 text-sativa border-sativa/30",
  hybrid: "bg-hybrid/15 text-hybrid border-hybrid/30",
};

export default function StrainBadge({ type }: { type: string }) {
  const style = typeStyles[type.toLowerCase()] ?? typeStyles.hybrid;
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${style}`}
    >
      {type}
    </span>
  );
}
