import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all works (for public display), newest first
export const getWorks = query({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.db.query("works").order("desc").collect();
  },
});

// Admin: get all works
export const getAllWorks = query({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.db.query("works").order("desc").collect();
  },
});

// Admin: add a new work
export const addWork = mutation({
  args: {
    title: v.string(),
    link: v.string(),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.insert("works", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

// Admin: update a work
export const updateWork = mutation({
  args: {
    id: v.id("works"),
    title: v.optional(v.string()),
    link: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const { id, ...fields } = args;
    const filtered = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Admin: delete a work
export const deleteWork = mutation({
  args: { id: v.id("works") },
  handler: async (ctx: any, args: any) => {
    await ctx.db.delete(args.id);
  },
});

// Generate upload URL for image storage
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Save image storage ID to work
export const saveWorkImageId = mutation({
  args: {
    id: v.id("works"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx: any, args: any) => {
    const url = await ctx.storage.getUrl(args.storageId);
    await ctx.db.patch(args.id, {
      imageId: args.storageId,
      imageUrl: url ?? undefined,
    });
  },
});

// Get image URL by storage ID
export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx: any, args: any) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
