import StrainBadge from "./StrainBadge";
import LikeButton from "./LikeButton";
import CommentSection from "./CommentSection";

interface ThoughtCardProps {
  id: string;
  userName: string;
  userImage?: string | null;
  anonymous?: boolean;
  text: string;
  strainName?: string | null;
  strainType?: string | null;
  gifUrl?: string | null;
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

export default function ThoughtCard({
  id,
  userName,
  userImage,
  anonymous,
  text,
  strainName,
  strainType,
  gifUrl,
  createdAt,
  likeCount,
  liked,
  comments,
}: ThoughtCardProps) {
  const displayName = anonymous ? "A mysterious stoner 👁️" : userName;
  const displayImage = anonymous ? null : userImage;

  return (
    <div className="rounded-2xl border border-accent-pink/20 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-primary-light/30">
          {displayImage ? (
            <img
              src={displayImage}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary">
              {anonymous ? "👁️" : displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{displayName}</span>
            <span className="rounded-full bg-accent-pink/10 px-2 py-0.5 text-[10px] font-medium text-accent-pink">
              💭 high thought
            </span>
          </div>

          {strainName && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xs text-muted">smoking</span>
              <span className="text-xs font-semibold text-primary">
                {strainName}
              </span>
              {strainType && <StrainBadge type={strainType} />}
            </div>
          )}

          <p className="mt-2 text-sm leading-relaxed">{text}</p>

          {gifUrl && (
            <img
              src={gifUrl}
              alt="GIF"
              className="mt-2 max-h-48 rounded-xl"
            />
          )}

          <p className="mt-2 text-xs text-muted">{timeAgo(createdAt)}</p>
        </div>
      </div>

      {/* Like & Comment */}
      <div className="mt-3 border-t border-card-border pt-2">
        <div className="flex items-center gap-3">
          <LikeButton thoughtId={id} initialLiked={liked} initialCount={likeCount} />
          <span className="text-xs text-muted">
            {comments.length > 0 ? `${comments.length} comment${comments.length === 1 ? "" : "s"}` : ""}
          </span>
        </div>
        <CommentSection
          thoughtId={id}
          initialComments={comments.map((c) => ({
            ...c,
            createdAt: c.createdAt.toString(),
          }))}
        />
      </div>
    </div>
  );
}
