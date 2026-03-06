import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StrainBadge from "@/components/StrainBadge";
import StarRating from "@/components/StarRating";
import MethodBadge from "@/components/MethodBadge";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const userId = session.user.id!;

  const entry = await prisma.entry.findUnique({
    where: { id },
    include: {
      user: true,
      strain: true,
      dispensary: true,
      likes: { select: { userId: true } },
      comments: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!entry) notFound();

  const feelings = entry.feelings as string[] | null;
  const photos = entry.photos as string[] | null;

  return (
    <div>
      <BackButton label="Back" fallbackHref="/" className="mb-4" />

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
          <Link href={`/strain/${entry.strain.id}`}>
            <h2 className="text-xl font-bold text-primary hover:underline">
              {entry.strain.name}
            </h2>
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StrainBadge type={entry.strain.type} />
            <StarRating rating={entry.rating} />
            {entry.method && <MethodBadge method={entry.method} />}
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

        {/* GIF */}
        {entry.gifUrl && (
          <div className="mt-4">
            <img
              src={entry.gifUrl}
              alt="GIF"
              className="max-h-64 rounded-xl"
            />
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

        {/* Like & Comment */}
        <div className="mt-4 border-t border-card-border pt-3">
          <LikeButton
            entryId={entry.id}
            initialLiked={entry.likes.some((l) => l.userId === userId)}
            initialCount={entry.likes.length}
          />
          <CommentSection
            entryId={entry.id}
            initialComments={entry.comments.map((c) => ({
              ...c,
              createdAt: c.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
