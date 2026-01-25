import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Legacy /curso/ URLs → new /clase/ URLs (301 permanent)
      {
        source: '/curso/:path*',
        destination: '/clase/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      // Spanish-friendly URLs → English courseType
      {
        source: '/clase/coparentalidad',
        destination: '/clase/coparenting',
      },
      {
        source: '/clase/coparentalidad/:path*',
        destination: '/clase/coparenting/:path*',
      },
      {
        source: '/clase/crianza',
        destination: '/clase/parenting',
      },
      {
        source: '/clase/crianza/:path*',
        destination: '/clase/parenting/:path*',
      },
    ]
  }
};

export default nextConfig;