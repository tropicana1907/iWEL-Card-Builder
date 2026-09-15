/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Default: this repo's own GitHub Pages. Override BASE_PATH to build for
  // another mount point, e.g. BASE_PATH=/iwel-presentations/card npm run build
  basePath: process.env.BASE_PATH ?? '/iWEL-Card-Builder',
  trailingSlash: true,
}

module.exports = nextConfig
