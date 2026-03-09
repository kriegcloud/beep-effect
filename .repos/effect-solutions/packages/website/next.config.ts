import createMDX from "@next/mdx"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  experimental: {
    lockDistDir: false,
  },
  async redirects() {
    return [
      {
        source: "/references",
        destination: "/",
        permanent: true,
      },
      {
        source: "/references/:slug",
        destination: "/:slug",
        permanent: true,
      },
    ]
  },
}

const withMDX = createMDX({
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
