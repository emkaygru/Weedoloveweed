"use client";

import { useState, useOptimistic } from "react";

interface Props {
  entryId?: string;
  thoughtId?: string;
  initialLiked: boolean;
  initialCount: number;
}

export default function LikeButton({
  entryId,
  thoughtId,
  initialLiked,
  initialCount,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(liked);
  const [optimisticCount, setOptimisticCount] = useOptimistic(count);

  const toggle = async () => {
    const newLiked = !liked;
    setOptimisticLiked(newLiked);
    setOptimisticCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, thoughtId }),
      });
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.liked ? count + 1 : count - 1);
    } catch {
      // Revert on error
      setOptimisticLiked(liked);
      setOptimisticCount(count);
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs transition-colors ${
        optimisticLiked
          ? "bg-accent-pink/10 text-accent-pink"
          : "text-muted hover:text-accent-pink"
      }`}
    >
      <span>{optimisticLiked ? "❤️" : "🤍"}</span>
      {optimisticCount > 0 && <span>{optimisticCount}</span>}
    </button>
  );
}
