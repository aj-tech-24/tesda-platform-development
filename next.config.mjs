/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.1.105', '192.168.1.107'],

  experimental: {},
}

export default nextConfig