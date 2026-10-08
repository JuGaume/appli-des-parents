# L'appli des parents

Web app (PWA) en français pour les parents d'enfants en primaire : on envoie photos, PDF et mails de l'école, l'IA en tire les événements et tâches, les met dans un agenda partagé entre parents, et aide pour les devoirs et les repas. Plan complet : `projets-retenus/01-appli-des-parents-plan-d-attaque.md` du dossier du projet.

## Stack
Next.js (App Router, TypeScript) · Tailwind · Supabase (Postgres + connexion par lien magique + stockage, région Paris) · Vercel · API Claude (Haiku pour l'extraction, Sonnet pour les devoirs) · Stripe · Resend · Vitest · Playwright.

## Règles qui ne se discutent pas
- Tous les textes de l'interface sont en français.
- Toute nouvelle table a la RLS activée, des règles par famille, et un test dans `supabase/tests/`.
- Pas de données d'enfants (prénoms, contenu de documents, photos) dans les journaux, Sentry ou PostHog : seulement des identifiants.
- Tous les appels à l'IA passent par `src/lib/ia/` ; les prompts sont des fichiers versionnés, avec sortie JSON vérifiée par Zod.
- Rien n'entre dans l'agenda sans confirmation du parent.
- Dates et heures en fuseau Europe/Paris ; toujours donner la date du jour au modèle.
- Aucune clé secrète côté navigateur. Seules les variables `NEXT_PUBLIC_*` du fichier `.env.example` sont publiques.
- Next.js 16 : le fichier s'appelle `src/proxy.ts` (plus `middleware.ts`). Les docs sont dans `node_modules/next/dist/docs/`.

## Commandes
- `npm run dev` : lancer l'app sur http://localhost:3000
- `npm test` : tests unitaires (Vitest)
- `npx supabase start` / `npx supabase stop` : base locale (Docker requis)
- `npx supabase test db` : tests de sécurité de la base (RLS)
- `npx supabase db reset` : rejouer toutes les migrations
- `npm run e2e` : parcours complet dans un navigateur, avec une fausse IA (base locale lancée ; `npx playwright install chromium` la première fois)
- `npm run eval` : mesure la lecture des documents par la vraie IA sur `evals/cas/` (clé dans `.env.local`, coûte quelques centimes). Objectif : 90 % de dates justes. À lancer avant de modifier un prompt ou un modèle.
- `npm run lint` et `npm run build` avant chaque fusion

## Organisation
- `src/app/` pages · `src/lib/supabase/` clients Supabase · `src/lib/validation.ts` schémas Zod
- `src/lib/ia/` appels à l'IA (client, prompts versionnés, extraction, évaluation)
- `supabase/migrations/` schéma · `supabase/tests/` tests SQL · `evals/` jeu d'évaluation · `e2e/` tests navigateur
