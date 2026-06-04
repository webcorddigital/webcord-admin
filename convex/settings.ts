import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get a single setting by key
export const getSetting = query({
  args: { key: v.string() },
  handler: async (ctx: any, args: any) => {
    const setting = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .unique();
    return setting?.value ?? null;
  },
});

// Get all settings
export const getAllSettings = query({
  args: {},
  handler: async (ctx: any) => {
    const settings = await ctx.db.query("site_settings").collect();
    const result: Record<string, unknown> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  },
});

// Upsert a setting
export const setSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q: any) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("site_settings", {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
      });
    }
  },
});
