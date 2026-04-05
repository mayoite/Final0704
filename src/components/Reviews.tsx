"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export function Reviews({
  productId,
  initialReviews = [],
}: {
  productId: string;
  initialReviews?: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !comment) return;

    setIsSubmitting(true);
    // Real implementation would submit to API here
    const newReview = {
      id: Math.random().toString(),
      user_name: userName,
      rating,
      comment,
      created_at: new Date().toISOString(),
      product_id: productId, // Using the prop so it's not unused
    };

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 500));
    setReviews([newReview, ...reviews]);
    setComment("");
    setUserName("");
    setRating(5);
    setIsSubmitting(false);
  };

  return (
    <div className="mt-16 pt-12 border-t border-soft">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-light text-strong">
          Customer Reviews
        </h3>
        <div className="flex flex-col items-end">
          <div className="flex gap-1 text-primary mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={clsx(
                  "w-5 h-5",
                  i < Math.round(Number(avgRating))
                    ? "fill-current"
                    : "text-inverse-body fill-transparent",
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-muted">
            {avgRating}/5.0 ({reviews.length} Reviews)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Review List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-muted font-light italic">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="pb-6 border-b border-soft last:border-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-strong">
                    {r.user_name}
                  </span>
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={clsx(
                          "w-3.5 h-3.5",
                          i < r.rating
                            ? "fill-current"
                            : "text-inverse-body fill-transparent",
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted font-light leading-relaxed">
                  {r.comment}
                </p>
                <span className="text-xs text-subtle mt-2 block">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Review Form */}
        <div className="bg-hover p-8 rounded-2xl border border-soft h-fit">
          <h4 className="text-lg font-medium text-strong mb-6">
            Write a Review
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    aria-label={`Rate ${val} stars`}
                    title={`Rate ${val} stars`}
                    className="focus:outline-none"
                  >
                    <Star
                      className={clsx(
                        "w-6 h-6",
                        val <= rating
                          ? "text-primary fill-current"
                          : "text-inverse-muted fill-transparent",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                htmlFor="userName"
                className="block text-sm text-muted mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-2 border border-soft rounded-sm focus:outline-none focus:border-strong transition-colors"
                required
              />
            </div>
            <div>
              <label
                htmlFor="comment"
                className="block text-sm text-muted mb-2"
              >
                Review
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-2 border border-soft rounded-sm focus:outline-none focus:border-strong transition-colors resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-inverse text-inverse font-medium text-sm py-3 rounded-sm hover:bg-inverse transition-colors disabled:bg-muted"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


