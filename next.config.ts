import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js bundler not to bundle bun-specific modules —
  // they are resolved at runtime by Bun.
  serverExternalPackages: ["bun:sqlite", "bun"],

  // Security headers on every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Limit referrer info sent to other origins
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable browser features not needed
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Basic XSS filter (legacy browsers)
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
