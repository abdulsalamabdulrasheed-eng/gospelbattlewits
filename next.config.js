/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.loca.lt"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

module.exports = nextConfig;