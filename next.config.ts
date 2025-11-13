/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // El que ya tenías de Pollinations
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
      },
      // El que ya tenías de tu Supabase Storage
      {
        protocol: 'https',
        hostname: 'ccgcuugdsiqhsimuwokb.supabase.co',
      },
      // El NUEVO que causó el error
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

// Solo necesitas esta línea una vez
module.exports = nextConfig;