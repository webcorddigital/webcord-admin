/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["convex"],
  webpack: (config) => {
    // Allow resolving convex from parent directory
    config.resolve.symlinks = true;
    return config;
  },
};

export default nextConfig;
