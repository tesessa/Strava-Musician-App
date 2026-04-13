/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@strava-musician-app/shared"],
  serverExternalPackages: ["bcrypt", "dotenv", "knex", "pg", "postgres"],
};

module.exports = nextConfig;
