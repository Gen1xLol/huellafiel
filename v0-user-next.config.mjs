/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para imágenes externas
  images: {
    domains: ['localhost', 'xsgames.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Configuración para webpack
  webpack: (config) => {
    // Resolver problemas con polyfills
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

export default nextConfig;

