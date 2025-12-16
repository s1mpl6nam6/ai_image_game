import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "storage.imagerouter.io"
      },
      {
        protocol: "https",
        hostname: "t4.ftcdn.net"
      }
    ],
  },
};

export default nextConfig;
