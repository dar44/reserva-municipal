import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  try {
    const { hostname } = new URL(supabaseUrl);
    remotePatterns.push({
      protocol: 'https',
      hostname,
      pathname: '/storage/v1/object/public/**'
    });
  } catch (error) {
    console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL for image optimization', error);
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns
  }
};

export default nextConfig;