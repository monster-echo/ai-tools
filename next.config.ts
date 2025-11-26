import type { NextConfig, SizeLimit } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: process.env.SERVERACTIONS_BODY_SIZE_LIMIT as SizeLimit,
    },
  },
};

export default nextConfig;
