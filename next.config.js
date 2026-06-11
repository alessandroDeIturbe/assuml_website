/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  // pdfjs-dist è ESM-only — va transpilato dal bundler di Next.js
  transpilePackages: ['pdfjs-dist'],
  images: {
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
  experimental: {},
  // Silenzia il warning Cross-Origin in dev (accesso da altri device sulla stessa rete)
  allowedDevOrigins: ['10.21.1.190', '10.21.*', '192.168.*', '172.*'],
}
module.exports = nextConfig
