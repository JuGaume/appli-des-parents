import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Photos et PDF envoyés depuis le téléphone (10 Mo maximum, vérifié aussi côté serveur).
    serverActions: { bodySizeLimit: "11mb" },
  },
};

export default nextConfig;
