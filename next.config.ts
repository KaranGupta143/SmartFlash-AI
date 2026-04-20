/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['pdf-parse', 'pdf2json'],
};

export default nextConfig;
