/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 🚫 Esto le dice a Next que ignore los errores de ESLint al hacer build
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Configuración para imágenes externas del backend
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8098',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**', // acepta cualquier dominio HTTPS
      },
      {
        protocol: 'http',
        hostname: '**', // acepta cualquier dominio HTTP 
      },
    ],
  },
  // Configurar rewrites si es necesario
  async rewrites() {
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:8098';
    return [
      // Rutas internas del organizador (manejadas por Next, no se proxied)
      {
        source: '/api/organizer/:path*',
        destination: '/api/organizer/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
