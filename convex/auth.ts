import { mutation } from "./_generated/server";
import { v } from "convex/values";

const AUTH_KEY = "admin_password";

// Securely verify password
export const verifyPassword = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", AUTH_KEY))
      .unique();
    
    if (!existing || !existing.value) return false;
    
    return args.password === existing.value;
  },
});

// Update password securely
export const updatePassword = mutation({
  args: { 
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("site_settings")
      .withIndex("by_key", (q) => q.eq("key", AUTH_KEY))
      .unique();
      
    const currentPassword = existing ? existing.value : null;
    
    if (args.oldPassword !== currentPassword) {
      throw new Error("Invalid current password");
    }
    
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.newPassword, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("site_settings", {
        key: AUTH_KEY,
        value: args.newPassword,
        updatedAt: Date.now(),
      });
    }
    
    return true;
  },
});
