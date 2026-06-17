/** @type {import('next').NextConfig} */
const API_ORIGIN = process.env.INTERNAL_API_URL || 'http://localhost:4000'

const nextConfig = {
  images: { unoptimized: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_ORIGIN}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
