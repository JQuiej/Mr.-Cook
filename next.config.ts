/** @type {import('next').NextConfig} */
const nextConfig = {
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'image.pollinations.ai',
    },
      {
        protocol: 'https',
        hostname: 'ccgcuugdsiqhsimuwokb.supabase.co',
      },
      // --- FIN DEL BLOQUE AÑADIDO ---
    ],
},
};

module.exports = nextConfig;
module.exports = nextConfig;