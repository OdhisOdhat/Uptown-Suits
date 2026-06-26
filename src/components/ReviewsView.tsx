import React, { useState, useEffect } from "react";
import { Star, MessageSquare, PenTool, CheckCircle, Award, Sparkles, StarHalf, X } from "lucide-react";
import { Review } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface ReviewsViewProps {
  user: { id: string; name: string; email: string; role: "customer" | "admin" } | null;
}

export default function ReviewsView({ user }: ReviewsViewProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState(user?.name || "");
  const [formEmail, setFormEmail] = useState(user?.email || "");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Filter State
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");

  // Sync user state to form
  useEffect(() => {
    if (user) {
      setFormName(user.name);
      setFormEmail(user.email);
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        throw new Error("Failed to load reviews");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formComment.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formName,
          customerEmail: formEmail,
          rating: formRating,
          comment: formComment
        })
      });

      if (res.ok) {
        setFormSuccess(true);
        setFormComment("");
        setFormRating(5);
        // Refresh reviews list
        fetchReviews();
        setTimeout(() => {
          setFormSuccess(false);
          setShowForm(false);
        }, 5000);
      } else {
        throw new Error("Failed to submit review");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0";

  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const score = Math.round(r.rating) as 5|4|3|2|1;
    if (ratingCounts[score] !== undefined) {
      ratingCounts[score]++;
    }
  });

  const filteredReviews = ratingFilter === "all"
    ? reviews
    : reviews.filter((r) => Math.round(r.rating) === ratingFilter);

  return (
    <div id="reviews-view-container" className="max-w-7xl mx-auto px-4 lg:px-12 py-10 text-stone-900">
      {/* Editorial Header */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="text-[10px] tracking-[0.3em] font-mono uppercase text-atelier-accent font-bold block mb-3">
          Sartorial Excellence Verified
        </span>
        <h1 className="font-serif text-4xl lg:text-5xl tracking-tight mb-4">
          Client Testimonials
        </h1>
        <div className="w-12 h-[1px] bg-atelier-accent mx-auto mb-6"></div>
        <p className="text-stone-600 font-sans text-sm leading-relaxed">
          At Uptown Suits, our commitment to artisanal handcrafting and master tailoring is reflected in the voice of our distinguished patrons.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Stats Column */}
        <div className="lg:col-span-4 bg-atelier-card border border-atelier-border rounded-xl p-8 shadow-sm">
          <h2 className="font-serif text-xl tracking-tight mb-6">Experience Score</h2>
          
          <div className="flex items-baseline space-x-3 mb-4">
            <span className="font-serif text-5xl font-bold tracking-tight text-stone-950">
              {averageRating}
            </span>
            <span className="text-stone-500 font-mono text-sm uppercase">out of 5.0</span>
          </div>

          {/* Star Rating Display */}
          <div className="flex items-center space-x-1 mb-6 text-atelier-accent">
            {Array.from({ length: 5 }).map((_, i) => {
              const val = parseFloat(averageRating);
              if (i < Math.floor(val)) {
                return <Star key={i} className="w-5 h-5 fill-atelier-accent text-atelier-accent" />;
              } else if (i < val) {
                return <StarHalf key={i} className="w-5 h-5 fill-atelier-accent text-atelier-accent" />;
              } else {
                return <Star key={i} className="w-5 h-5 text-stone-300" />;
              }
            })}
            <span className="text-stone-500 font-mono text-xs ml-2">({totalReviews} Reviews)</span>
          </div>

          <div className="w-full h-[1px] bg-stone-300/60 my-6"></div>

          {/* Rating Distribution Bars */}
          <div className="space-y-3 mb-8">
            {([5, 4, 3, 2, 1] as const).map((num) => {
              const count = ratingCounts[num] || 0;
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <button
                  key={num}
                  onClick={() => setRatingFilter(ratingFilter === num ? "all" : num)}
                  className={`w-full flex items-center text-left text-xs font-mono group cursor-pointer transition-all ${
                    ratingFilter === num ? "text-atelier-accent font-bold scale-[1.02]" : "text-stone-600 hover:text-stone-950"
                  }`}
                >
                  <span className="w-3 mr-2">{num}★</span>
                  <div className="flex-1 h-2 bg-stone-200/80 rounded-full overflow-hidden mx-3">
                    <div
                      className="h-full bg-atelier-accent rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right text-stone-400 font-medium group-hover:text-stone-950">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormSuccess(false);
            }}
            className="w-full flex items-center justify-center space-x-2 bg-stone-950 hover:bg-stone-900 text-white font-mono text-xs uppercase tracking-widest py-4 px-6 rounded-lg transition-colors cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Right Reviews List Column */}
        <div className="lg:col-span-8">
          {/* Submission form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-10"
              >
                <div className="bg-white border border-atelier-border rounded-xl p-8 shadow-md relative">
                  <button
                    onClick={() => setShowForm(false)}
                    className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h3 className="font-serif text-2xl tracking-tight mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-atelier-accent fill-atelier-accent/20" />
                    Share Your Experience
                  </h3>

                  {formSuccess ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-stone-50 border border-emerald-500/20 text-stone-800 rounded-xl p-6 text-center"
                    >
                      <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                      <h4 className="font-serif text-lg font-bold text-stone-900 mb-2">Review Submitted Successfully</h4>
                      <p className="text-stone-600 text-xs leading-relaxed max-w-md mx-auto">
                        Thank you for sharing your journey. To uphold the premium integrity of Uptown Suits, all testimonials undergo Master Tailor approval before display.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-2 font-bold">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g., Alistair Vance"
                            className="w-full bg-stone-50 border border-stone-200 focus:border-atelier-accent focus:bg-white text-stone-900 px-4 py-3 text-sm rounded-lg outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-2 font-bold">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            required
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            placeholder="e.g., alistair@example.com"
                            className="w-full bg-stone-50 border border-stone-200 focus:border-atelier-accent focus:bg-white text-stone-900 px-4 py-3 text-sm rounded-lg outline-none transition-all"
                          />
                        </div>
                      </div>

                      {/* Interactive Rating Star Selection */}
                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-3 font-bold">
                          Patron Sizing & Satisfaction Rating
                        </label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormRating(star)}
                              className="p-1 cursor-pointer transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  star <= formRating
                                    ? "fill-atelier-accent text-atelier-accent"
                                    : "text-stone-300 hover:text-atelier-accent/50"
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-3 font-mono text-xs text-stone-500">
                            {formRating === 5
                              ? "Flawless Bespoke Experience"
                              : formRating === 4
                              ? "Excellent Fit & Service"
                              : formRating === 3
                              ? "Satisfactory Quality"
                              : formRating === 2
                              ? "Needs Adjustments"
                              : "Disappointed"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-500 mb-2 font-bold">
                          The Testimonial Commentary *
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={formComment}
                          onChange={(e) => setFormComment(e.target.value)}
                          placeholder="Describe the fit of your suit, the craftsmanship, the experience with our designers..."
                          className="w-full bg-stone-50 border border-stone-200 focus:border-atelier-accent focus:bg-white text-stone-900 px-4 py-3 text-sm rounded-lg outline-none transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-stone-950 hover:bg-stone-900 text-white font-mono text-xs uppercase tracking-widest py-3.5 px-6 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {submitting ? "Transmitting..." : "Submit to Master Tailor"}
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters summary */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg tracking-tight text-stone-900">
              {ratingFilter === "all" ? "All Verified Reviews" : `${ratingFilter}★ Customer Reviews`}
            </h3>
            {ratingFilter !== "all" && (
              <button
                onClick={() => setRatingFilter("all")}
                className="text-[10px] font-mono text-atelier-accent hover:underline uppercase tracking-wider cursor-pointer"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Loading or Reviews List */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-atelier-card h-32 rounded-xl border border-atelier-border"></div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-800">
              <p className="font-mono text-xs">{error}</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="bg-atelier-card/50 border border-dashed border-atelier-border rounded-xl py-12 px-6 text-center">
              <MessageSquare className="w-10 h-10 text-stone-400 mx-auto mb-3" />
              <p className="font-serif text-stone-700 italic">No reviews match this rating filter yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white border border-atelier-border rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Rating stars */}
                  <div className="flex items-center space-x-1 mb-4 text-atelier-accent">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-4 h-4 ${idx < review.rating ? "fill-atelier-accent text-atelier-accent" : "text-stone-200"}`}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="font-serif text-stone-800 italic leading-relaxed text-sm mb-6 pl-4 border-l border-atelier-accent">
                    "{review.comment}"
                  </p>

                  {/* Reviewer Details */}
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center space-x-3">
                      <div className="bg-atelier-bg text-atelier-accent w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-atelier-border shadow-sm">
                        {review.customerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-stone-900">{review.customerName}</span>
                          <div className="flex items-center text-[8px] bg-stone-100 text-stone-500 font-mono tracking-widest px-2 py-0.5 rounded uppercase font-bold">
                            <Award className="w-2.5 h-2.5 text-atelier-accent mr-1 fill-atelier-accent/10" />
                            Verified Patron
                          </div>
                        </div>
                        <span className="text-[9px] font-mono text-stone-400 block mt-0.5 uppercase tracking-widest">
                          {review.date}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
