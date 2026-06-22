/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // This allows Next.js to resize images from these specific websites
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // This covers all Supabase projects
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;