import Link from "next/link";
import StrainBadge from "./StrainBadge";
import StarRating from "./StarRating";
import MethodBadge from "./MethodBadge";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";

interface FeedCardProps {
  id: string;
  userName: string;
  userImage?: string | null;
  strainName: string;
  strainType: string;
  rating: number;
  method?: string | null;
  dispensaryName?: string | null;
  photoUrl?: string | null;
  gifUrl?: string | null;
  review?: string | null;
  munchies?: string[] | null;
  createdAt: Date;
  likeCount: number;
  liked: boolean;
  comments: Array<{
    id: string;
    text: string;
    gifUrl?: string | null;
    createdAt: string;
    user: { name: string | null; image: string | null };
  }>;
  currentUserId: string;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

export default function FeedCard({
  id,
  userName,
  userImage,
  strainName,
  strainType,
  rating,
  method,
  dispensaryName,
  photoUrl,
  gifUrl,
  review,
  munchies,
  createdAt,
  likeCount,
  liked,
  comments,
}: FeedCardProps) {
  return (
    <div className="rounded-2xl border border-card-border bg-card p-4 shadow-sm">
      <Link href={`/log/${id}`}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-primary-light/30">
            {userImage ? (
              <img
                src={userImage}
                alt={userName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-bold">{userName}</span>
              <span className="text-muted"> is smoking </span>
              <span className="font-bold text-primary">{strainName}</span>
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <StrainBadge type={strainType} />
              <StarRating rating={rating} />
              {method && <MethodBadge method={method} />}
              {dispensaryName && (
                <span className="text-xs text-muted">
                  @ {dispensaryName}
                </span>
              )}
            </div>

            {review && (
              <p className="mt-2 text-sm text-muted line-clamp-2">{review}</p>
            )}

            {munchies && munchies.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-muted">🍕</span>
                {munchies.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-accent-yellow/20 px-2 py-0.5 text-xs font-medium text-accent-yellow"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-1 text-xs text-muted">{timeAgo(createdAt)}</p>
          </div>

          {/* Photo thumbnail */}
          {photoUrl && (
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={photoUrl}
                alt={strainName}
                className="h-full w-full object-cover"
              />
            </div>
          )}
        </div>

        {/* GIF */}
        {gifUrl && (
          <div className="mt-3">
            <img
              src={gifUrl}
              alt="GIF"
              className="max-h-48 w-full rounded-xl object-cover"
            />
          </div>
        )}
      </Link>

      {/* Like & Comment */}
      <div className="mt-3 border-t border-card-border pt-2">
        <div className="flex items-center gap-3">
          <LikeButton entryId={id} initialLiked={liked} initialCount={likeCount} />
          <span className="text-xs text-muted">
            {comments.length > 0 ? `${comments.length} comment${comments.length === 1 ? "" : "s"}` : ""}
          </span>
        </div>
        <CommentSection
          entryId={id}
          initialComments={comments.map((c) => ({
            ...c,
            createdAt: c.createdAt.toString(),
          }))}
        />
      </div>
    </div>
  );
}
