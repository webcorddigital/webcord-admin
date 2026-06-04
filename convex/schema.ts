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
});
