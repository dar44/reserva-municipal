import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'class-variance-authority',
      '@radix-ui/react-slot',
      'next-themes',
    ],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nwhvezrclrmoyrcnijaw.supabase.co",
      },
    ],
  },
};

export default nextConfig;
