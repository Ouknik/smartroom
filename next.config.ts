import type { NextConfig } from "next";

const BACKEND_API = process.env.API_BASE_URL ?? "http://backend.seedalotour.shop/api";

const nextConfig: NextConfig = {
  // ─── Performance & Security ─────────────────────────────────────────────────
  poweredByHeader: false,
  compress: true,

  // ─── API Proxy Rewrites ──────────────────────────────────────────────────────
  // All browser requests to /backend/* are silently proxied to the Laravel API
  // on the server side — no CORS headers needed on Laravel.
  //
  // Example: axios.get('/backend/rooms')
  //       → fetched from http://backend.seedalotour.shop/api/rooms  (server-side)
  //
  // The lib/axios.ts still uses NEXT_PUBLIC_API_URL for direct calls.
  // Use /backend/* only if you want server-proxied calls.
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${BACKEND_API}/:path*`,
      },
    ];
  },

  // ─── Images ─────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "backend.seedalotour.shop",
      },
      {
        protocol: "https",
        hostname: "backend.seedalotour.shop",
      },
    ],
  },

  // ─── Security Headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options",        value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

};

export default nextConfig;
