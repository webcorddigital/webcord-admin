import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import content from "../../webcord/data/content.json";

// ─────────────────────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────────────────────

export const getAllPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("plans").collect();
  },
});

export const getPlansByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("plans")
      .withIndex("by_category", (q) => q.eq("category", args.category as any))
      .collect();
    
    // Sort by order ascending and map _id to id
    return plans
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(p => ({ ...p, id: p._id }));
  },
});

export const getPlanBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const plan = await ctx.db
      .query("plans")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return plan ? { ...plan, id: plan._id } : null;
  },
});

// ─────────────────────────────────────────────────────────────
// MUTATIONS (Admin)
// ─────────────────────────────────────────────────────────────

export const updatePlan = mutation({
  args: {
    id: v.id("plans"),
    slug: v.string(),
    category: v.union(v.literal("website"), v.literal("monthly"), v.literal("video")),
    badge: v.string(),
    name: v.string(),
    price: v.number(),
    priceLabel: v.string(),
    delivery: v.string(),
    features: v.array(v.string()),
    featured: v.optional(v.boolean()),
    description: v.string(),
    whatYouGet: v.array(v.string()),
    idealFor: v.array(v.string()),
    faqs: v.array(v.object({ question: v.string(), answer: v.string() })),
    reviewCount: v.number(),
    reviewAvg: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const seedPlans = mutation({
  args: {},
  handler: async (ctx) => {
    const plans = content.plans as any[];
    // Delete existing
    const existing = await ctx.db.query("plans").collect();
    for (const plan of existing) {
      await ctx.db.delete(plan._id);
    }
    // Insert new
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      // remove id from json to let convex assign _id
      const { id, ...planData } = plan;
      await ctx.db.insert("plans", { ...planData, order: i });
    }
  },
});
