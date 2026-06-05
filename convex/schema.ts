import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  works: defineTable({
    title: v.string(),
    link: v.string(),
    imageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
    order: v.optional(v.number()),
  }),

  reviews: defineTable({
    workId: v.optional(v.id("works")), // optional: general review, not tied to specific work
    author: v.string(),
    business: v.optional(v.string()),
    text: v.string(),
    rating: v.number(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    createdAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_work_and_status", ["workId", "status"]),

  site_settings: defineTable({
    key: v.string(),
    value: v.any(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  plans: defineTable({
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
    order: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),
});
