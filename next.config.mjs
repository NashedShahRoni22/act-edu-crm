/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api-actedu.fahimsultan.com',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ["api-actedu.fahimsultan.com"],
  },
};

export default nextConfig;
