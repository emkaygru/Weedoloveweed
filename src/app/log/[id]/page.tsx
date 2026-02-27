import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StrainBadge from "@/components/StrainBadge";
import StarRating from "@/components/StarRating";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      user: true,
      strain: true,
      dispensary: true,
    },
  });

  if (!entry) notFound();

  const feelings = entry.feelings as string[] | null;
  const photos = entry.photos as string[] | null;

  return (
    <div>
      <div className="rounded-2xl border border-card-border bg-card p-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-primary-light/30">
            {entry.user.image ? (
              <img
                src={entry.user.image}
                alt={entry.user.name ?? ""}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                {(entry.user.name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-bold">{entry.user.name}</p>
            <p className="text-xs text-muted">
              {entry.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Strain info */}
        <div className="mt-4">
          <h2 className="text-xl font-bold text-primary">
            {entry.strain.name}
          </h2>
          <div className="mt-1 flex items-center gap-2">
            <StrainBadge type={entry.strain.type} />
            <StarRating rating={entry.rating} />
          </div>
        </div>

        {/* Photos */}
        {photos && photos.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {photos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Photo ${i + 1}`}
                className="h-48 w-48 flex-shrink-0 rounded-xl object-cover"
              />
            ))}
          </div>
        )}

        {/* Review */}
        {entry.review && (
          <p className="mt-4 text-sm leading-relaxed">{entry.review}</p>
        )}

        {/* Feelings */}
        {feelings && feelings.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {feelings.map((feeling) => (
              <span
                key={feeling}
                className="rounded-full bg-accent-pink/10 px-2.5 py-0.5 text-xs font-medium text-accent-pink"
              >
                {feeling}
              </span>
            ))}
          </div>
        )}

        {/* Purchase info */}
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
          {entry.dispensary && (
            <span>📍 {entry.dispensary.name}</span>
          )}
          {entry.brand && <span>🏷️ {entry.brand}</span>}
        </div>
      </div>
    </div>
  );
}
