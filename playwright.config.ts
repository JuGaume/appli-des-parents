import { defineConfig } from "@playwright/test";

// Parcours complet dans un vrai navigateur, contre la base locale (npx supabase start)
// et une fausse IA (e2e/fausse-ia.mjs). Lancer avec : npm run e2e
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  workers: 1,
  use: {
    baseURL: "http://localhost:3000",
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      ANTHROPIC_API_KEY: "cle-de-test",
      ANTHROPIC_BASE_URL: "http://127.0.0.1:4010",
    },
  },
});
