/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["fonts.googleapis.com", "fonts.gstatic.com"],
  },
  experimental: {
    webVitalsAttribution: ["CLS", "LCP"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
