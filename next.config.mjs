/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["@remotion/bundler", "@remotion/renderer", "webpack"],
  webpack: (config) => {
    config.externals.push({
      "@remotion/compositor-linux-arm64-gnu": "commonjs @remotion/compositor-linux-arm64-gnu",
      "@remotion/compositor-linux-arm64-musl": "commonjs @remotion/compositor-linux-arm64-musl",
      "@remotion/compositor-linux-x64-gnu": "commonjs @remotion/compositor-linux-x64-gnu",
      "@remotion/compositor-linux-x64-musl": "commonjs @remotion/compositor-linux-x64-musl",
      "@remotion/compositor-win32-x64-msvc": "commonjs @remotion/compositor-win32-x64-msvc",
    });
    return config;
  },
}

export default nextConfig
