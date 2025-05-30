import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Disable type checking during build to isolate the issue
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
