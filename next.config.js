/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  reactStrictMode: true,
  images: {
    domains: ["img.youtube.com"],
  },
  async redirects() {
    return [
      {
        source: "/pools",
        destination: "/staking",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
