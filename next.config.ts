import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Upload foto dari admin › Website (maks. 5 MB per foto + overhead multipart)
    serverActions: {
      bodySizeLimit: '6mb',
    },
  },
};

export default nextConfig;
