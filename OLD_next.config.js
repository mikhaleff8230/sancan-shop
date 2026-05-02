/** @type {import('next').NextConfig} */
const runtimeCaching = require('next-pwa/cache');
const { i18n } = require('./next-i18next.config');

const withPWA = require('next-pwa')({
  disable: process.env.NODE_ENV === 'development',
  dest: 'public',
  runtimeCaching,
});

module.exports = withPWA({
  reactStrictMode: true,
  i18n,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_REST_API_ENDPOINT || 'https://api.sancan.ru'}/:path*`,
      },
    ];
  },
  images: {
    domains: [
      'localhost',
      '127.0.0.1:8000',
      'maps.googleapis.com',
      's3.amazonaws.com',
      'sancan.ru',
      'api.sancan.ru', // добавлен API домен для изображений
      'pixarlaravel.s3.ap-southeast-1.amazonaws.com',
      'pickbazarlaravel.s3.ap-southeast-1.amazonaws.com',
      '45.10.41.84', // добавлен API-домен
      's3.twcstorage.ru', // добавлен Timeweb S3 домен
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '45.10.41.84',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'sancan.ru',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'api.sancan.ru',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: 's3.twcstorage.ru',
        pathname: '/**',
      },
    ],
  },
  ...(process.env.APPLICATION_MODE === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
});
