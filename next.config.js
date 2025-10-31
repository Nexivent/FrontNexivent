/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 🚫 Esto le dice a Next que ignore los errores de ESLint al hacer build
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
