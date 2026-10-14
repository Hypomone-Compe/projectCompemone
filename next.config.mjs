/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /* Ada package-lock.json lain di C:\Users\nugra — kunci root ke folder proyek. */
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
