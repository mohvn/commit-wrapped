import type { NextConfig } from "next"

const isGithubPages = process.env.GITHUB_PAGES === "true"

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  ...(isGithubPages
    ? {
        basePath: "/commit-wrapped",
        assetPrefix: "/commit-wrapped",
      }
    : {}),
  experimental: {
    agentFeedback: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
}

export default nextConfig
