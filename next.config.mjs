/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'localhost',
      'res.cloudinary.com',
      'images.compressibleflowcalculator.com',
      'imageapi.compressibleflowcalculator.com',
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};

//import { withTurbopack } from 'next-turbopack';

//configure turbopack
const nextConfig2 = {
  reactStrictMode: true,
  experimental: {},
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};

export default nextConfig;
