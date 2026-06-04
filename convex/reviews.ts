import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Public: Get all approved reviews
export const getApprovedReviews = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", "approved"))
      .order("desc")
      .collect();
  },
});

// Public: submit a review
export const submitReview = mutation({
  args: {
    workId: v.optional(v.id("works")),
    author: v.string(),
    business: v.optional(v.string()),
    text: v.string(),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reviews", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Admin: get all reviews by status
export const getReviewsByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reviews")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

// Admin: approve review
export const approveReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "approved" });
  },
});

// Admin: reject review
export const rejectReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "rejected" });
  },
});

// Admin: delete review
export const deleteReview = mutation({
  args: { id: v.id("reviews") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
