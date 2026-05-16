import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {}, // ✅ fix turbopack error

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "falcon-sincere-gelding.ngrok-free.app",
      },
    ],
  },
};

export default nextConfig;