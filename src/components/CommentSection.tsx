"use client";

import { useState } from "react";

interface Comment {
  id: string;
  text: string;
  gifUrl?: string | null;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
}

interface Props {
  entryId?: string;
  thoughtId?: string;
  initialComments: Comment[];
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function CommentSection({
  entryId,
  thoughtId,
  initialComments,
}: Props) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, thoughtId, text: text.trim() }),
      });
      const comment = await res.json();
      setComments([...comments, comment]);
      setText("");
    } catch {
      // Error posting comment
    } finally {
      setSubmitting(false);
    }
  };

  const visibleComments = expanded ? comments : comments.slice(0, 2);

  return (
    <div className="mt-2">
      {/* Comment count / expand */}
      {comments.length > 0 && (
        <div className="space-y-2">
          {comments.length > 2 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-muted hover:text-foreground"
            >
              View all {comments.length} comments
            </button>
          )}

          {visibleComments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-primary-light/30">
                {c.user.image ? (
                  <img src={c.user.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
                    {(c.user.name ?? "?").charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs">
                  <span className="font-semibold">{c.user.name}</span>{" "}
                  <span className="text-muted">{c.text}</span>
                </p>
                {c.gifUrl && (
                  <img
                    src={c.gifUrl}
                    alt="GIF"
                    className="mt-1 max-h-32 rounded-lg"
                  />
                )}
                <span className="text-[10px] text-muted">{timeAgo(c.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Add a comment..."
          className="min-w-0 flex-1 rounded-full border border-card-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
        />
        {text.trim() && (
          <button
            onClick={submit}
            disabled={submitting}
            className="text-xs font-semibold text-primary disabled:opacity-50"
          >
            Post
          </button>
        )}
      </div>
    </div>
  );
}
