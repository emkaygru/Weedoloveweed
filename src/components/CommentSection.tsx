"use client";

import { useState } from "react";

interface Reply {
  id: string;
  text: string;
  gifUrl?: string | null;
  createdAt: string;
  user: { name: string | null; image: string | null };
  likes: { userId: string }[];
}

interface Comment {
  id: string;
  text: string;
  gifUrl?: string | null;
  createdAt: string;
  user: { name: string | null; image: string | null };
  likes: { userId: string }[];
  replies: Reply[];
}

interface Props {
  entryId?: string;
  thoughtId?: string;
  initialComments: Comment[];
  currentUserId?: string;
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

function Avatar({ image, name }: { image: string | null; name: string | null }) {
  return (
    <div className="h-6 w-6 flex-shrink-0 overflow-hidden rounded-full bg-primary-light/30">
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-primary">
          {(name ?? "?").charAt(0)}
        </div>
      )}
    </div>
  );
}

function CommentLikeButton({
  commentId,
  likes,
  currentUserId,
}: {
  commentId: string;
  likes: { userId: string }[];
  currentUserId?: string;
}) {
  const [liked, setLiked] = useState(likes.some((l) => l.userId === currentUserId));
  const [count, setCount] = useState(likes.length);

  const toggle = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : c - 1));
    try {
      await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
    } catch {
      setLiked(!newLiked);
      setCount((c) => (newLiked ? c - 1 : c + 1));
    }
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-0.5 text-[10px] transition-colors ${
        liked ? "text-accent-pink" : "text-muted hover:text-accent-pink"
      }`}
    >
      {liked ? "❤️" : "♡"} {count > 0 && count}
    </button>
  );
}

function ReplyRow({
  reply,
  currentUserId,
}: {
  reply: Reply;
  currentUserId?: string;
}) {
  return (
    <div className="flex gap-2 pl-8">
      <Avatar image={reply.user.image} name={reply.user.name} />
      <div className="min-w-0 flex-1">
        <p className="text-xs">
          <span className="font-semibold">{reply.user.name}</span>{" "}
          <span className="text-muted">{reply.text}</span>
        </p>
        {reply.gifUrl && (
          <img src={reply.gifUrl} alt="GIF" className="mt-1 max-h-24 rounded-lg" />
        )}
        <div className="mt-0.5 flex items-center gap-3">
          <span className="text-[10px] text-muted">{timeAgo(reply.createdAt)}</span>
          <CommentLikeButton
            commentId={reply.id}
            likes={reply.likes}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}

function CommentRow({
  comment,
  currentUserId,
  onReply,
}: {
  comment: Comment;
  currentUserId?: string;
  onReply: (commentId: string, name: string) => void;
}) {
  const [replies, setReplies] = useState(comment.replies);
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Avatar image={comment.user.image} name={comment.user.name} />
        <div className="min-w-0 flex-1">
          <p className="text-xs">
            <span className="font-semibold">{comment.user.name}</span>{" "}
            <span className="text-muted">{comment.text}</span>
          </p>
          {comment.gifUrl && (
            <img src={comment.gifUrl} alt="GIF" className="mt-1 max-h-32 rounded-lg" />
          )}
          <div className="mt-0.5 flex items-center gap-3">
            <span className="text-[10px] text-muted">{timeAgo(comment.createdAt)}</span>
            <CommentLikeButton
              commentId={comment.id}
              likes={comment.likes}
              currentUserId={currentUserId}
            />
            <button
              onClick={() => onReply(comment.id, comment.user.name ?? "them")}
              className="text-[10px] font-semibold text-muted hover:text-foreground"
            >
              Reply
            </button>
            {replies.length > 0 && (
              <button
                onClick={() => setShowReplies((v) => !v)}
                className="text-[10px] text-muted hover:text-foreground"
              >
                {showReplies ? "Hide" : `View ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies && replies.map((r) => (
        <ReplyRow key={r.id} reply={r} currentUserId={currentUserId} />
      ))}
    </div>
  );
}

export default function CommentSection({
  entryId,
  thoughtId,
  initialComments,
  currentUserId,
}: Props) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

  const handleReply = (commentId: string, name: string) => {
    setReplyTo({ id: commentId, name });
  };

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);

    try {
      const body: Record<string, string> = { text: text.trim() };
      if (replyTo) {
        body.parentId = replyTo.id;
      } else if (entryId) {
        body.entryId = entryId;
      } else if (thoughtId) {
        body.thoughtId = thoughtId;
      }

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const newComment = await res.json();

      if (replyTo) {
        // Add reply to parent comment
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyTo.id
              ? { ...c, replies: [...c.replies, newComment] }
              : c
          )
        );
        setReplyTo(null);
      } else {
        setComments((prev) => [...prev, { ...newComment, replies: newComment.replies ?? [] }]);
      }
      setText("");
    } catch {
      // Error posting
    } finally {
      setSubmitting(false);
    }
  };

  const visibleComments = expanded ? comments : comments.slice(0, 2);

  return (
    <div className="mt-2">
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.length > 2 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-muted hover:text-foreground"
            >
              View all {comments.length} comments
            </button>
          )}

          {visibleComments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onReply={handleReply}
            />
          ))}
        </div>
      )}

      {/* Reply indicator */}
      {replyTo && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-1.5">
          <span className="text-xs text-muted">Replying to <strong>{replyTo.name}</strong></span>
          <button
            onClick={() => setReplyTo(null)}
            className="ml-auto text-xs text-muted hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}

      {/* Comment input */}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={replyTo ? `Reply to ${replyTo.name}...` : "Add a comment..."}
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
