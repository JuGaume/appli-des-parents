import { z } from "zod";

export const CLASSES = [
  "creche", "PS", "MS", "GS", "CP", "CE1", "CE2", "CM1", "CM2", "6e", "5e", "4e", "3e", "lycee",
] as const;

export const LIBELLES_CLASSES: Record<(typeof CLASSES)[number], string> = {
  creche: "Crèche ou nounou",
  PS: "Petite section",
  MS: "Moyenne section",
  GS: "Grande section",
  CP: "CP",
  CE1: "CE1",
  CE2: "CE2",
  CM1: "CM1",
  CM2: "CM2",
  "6e": "6e",
  "5e": "5e",
  "4e": "4e",
  "3e": "3e",
  lycee: "Lycée",
};

export const emailSchema = z.email({ message: "Adresse e-mail invalide." });

export const familleSchema = z.object({
  nom: z.string().trim().min(1, "Donne un nom à ta famille.").max(80),
});

// "arachides, lait , ," -> ["arachides", "lait"]
export function lireAllergies(texte: string): string[] {
  return texte
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0)
    .slice(0, 20);
}

export const enfantSchema = z.object({
  prenom: z.string().trim().min(1, "Le prénom est obligatoire.").max(40),
  anneeNaissance: z.coerce
    .number()
    .int()
    .min(2005, "Année de naissance invalide.")
    .max(new Date().getFullYear(), "Année de naissance invalide.")
    .optional(),
  classe: z.enum(CLASSES).optional(),
  allergies: z.string().max(500).transform(lireAllergies),
  gouts: z.string().trim().max(500).optional(),
});
