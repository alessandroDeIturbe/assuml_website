/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    // Immagini locali in /public non richiedono remotePatterns ma serve unoptimized: false (default)
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh1.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh2.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: '**.googleapis.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },
  // Sopprime i warning di Next.js 14 sul campo `version` obsoleto in docker-compose
  experimental: {},
}
module.exports = nextConfig
