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
  // Configurar rewrites si es necesario
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8098/:path*',
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
