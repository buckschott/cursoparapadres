import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/curso/coparentalidad',
        destination: '/curso/coparenting',
      },
      {
        source: '/curso/coparentalidad/:path*',
        destination: '/curso/coparenting/:path*',
      },
      {
        source: '/curso/crianza',
        destination: '/curso/parenting',
      },
      {
        source: '/curso/crianza/:path*',
        destination: '/curso/parenting/:path*',
      },
    ]
  }
};

export default nextConfig;
