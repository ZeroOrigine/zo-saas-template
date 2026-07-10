/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/products', destination: '/#products', permanent: false },
      { source: '/about', destination: '/#manifesto', permanent: false },
      { source: '/minds', destination: '/#minds', permanent: false },
      { source: '/constitution', destination: '/#constitution', permanent: false },
    ];
  },
};

export default nextConfig;
