import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// La famille de l'utilisateur connecté (null s'il n'en a pas encore).
// cache() évite de la relire plusieurs fois pendant un même affichage de page.
export const lireFamille = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("familles").select("id, nom").limit(1);
  return data?.[0] ?? null;
});

const COULEURS_AVATARS = [
  "bg-rose-200 text-rose-900",
  "bg-amber-200 text-amber-900",
  "bg-emerald-200 text-emerald-900",
  "bg-sky-200 text-sky-900",
  "bg-violet-200 text-violet-900",
  "bg-orange-200 text-orange-900",
];

export function couleurAvatar(id: string) {
  let somme = 0;
  for (const c of id) somme += c.charCodeAt(0);
  return COULEURS_AVATARS[somme % COULEURS_AVATARS.length];
}

export function ageEnAnnees(anneeNaissance: number | null, annee = new Date().getFullYear()) {
  return anneeNaissance ? annee - anneeNaissance : null;
}
