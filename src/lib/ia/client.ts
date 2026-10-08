import Anthropic from "@anthropic-ai/sdk";

// Tous les appels à l'IA passent par src/lib/ia/. Aucune clé n'est lue ailleurs.
let client: Anthropic | null = null;

export function clientIA(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY manquante : ajoute-la dans .env.local");
  }
  client ??= new Anthropic({ maxRetries: 2, timeout: 50_000 });
  return client;
}

// Petit modèle rapide pour lire les documents ; un plus fort servira aux devoirs.
export const MODELE_EXTRACTION = "claude-haiku-5-5";
