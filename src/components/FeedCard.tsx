import Link from "next/link";
import StrainBadge from "./StrainBadge";
import StarRating from "./StarRating";

interface FeedCardProps {
  id: string;
  userName: string;
  userImage?: string | null;
  strainName: string;
  strainType: string;
  rating: number;
  dispensaryName?: string | null;
  photoUrl?: string | null;
  createdAt: Date;
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
  dispensaryName,
  photoUrl,
  createdAt,
}: FeedCardProps) {
  return (
    <Link href={`/log/${id}`}>
      <div className="rounded-2xl border border-card-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
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
              {dispensaryName && (
                <span className="text-xs text-muted">
                  @ {dispensaryName}
                </span>
              )}
            </div>

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
      </div>
    </Link>
  );
}
