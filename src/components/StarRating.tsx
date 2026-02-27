export default function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-sm">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-accent-yellow" : "text-card-border"}
        >
          ★
        </span>
      ))}
    </span>
  );
}
