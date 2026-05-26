import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js bundler to leave these as external requires
  // (resolved at runtime by Bun, not bundled by webpack/turbopack)
  serverExternalPackages: ["bun:sqlite", "bun"],
};

export default nextConfig;
