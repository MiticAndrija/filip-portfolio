import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  experimental: { agentUpgrade: "security" },
};

export default nextConfig;
