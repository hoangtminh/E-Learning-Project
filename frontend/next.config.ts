import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker standalone builds (frontend/Dockerfile)
  output: "standalone",
};

export default nextConfig;

