/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // ✅ This is critical

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
