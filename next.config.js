const { getSecurityHeaders } = require('./lib/security/csp');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: getSecurityHeaders(),
      },
    ];
  },
};

module.exports = nextConfig;
