// Default: this repo's own GitHub Pages. Override BASE_PATH to build for
// another mount point.
const basePath = process.env.BASE_PATH ?? '/iWEL-Card-Builder'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath,
  trailingSlash: true,
  env: {
    // Plain <img src> is not auto-prefixed by Next basePath — template asset
    // URLs are built with this value (src/config/templateAssets.ts)
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

module.exports = nextConfig
