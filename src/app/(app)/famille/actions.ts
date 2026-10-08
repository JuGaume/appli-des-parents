"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { lireFamille } from "@/lib/famille";
import { createClient } from "@/lib/supabase/server";
import { enfantSchema, familleSchema } from "@/lib/validation";

function lireFormulaireEnfant(formData: FormData) {
  return enfantSchema.safeParse({
    prenom: formData.get("prenom"),
    anneeNaissance: formData.get("anneeNaissance") || undefined,
    classe: formData.get("classe") || undefined,
    allergies: formData.get("allergies") ?? "",
    gouts: formData.get("gouts") || undefined,
  });
}

export async function creerFamille(formData: FormData) {
  const v = familleSchema.safeParse({ nom: formData.get("nom") });
  if (!v.success) return;

  const supabase = await createClient();
  await supabase.rpc("creer_famille", { nom: v.data.nom });
  revalidatePath("/famille");
}

export async function ajouterEnfant(formData: FormData) {
  const v = lireFormulaireEnfant(formData);
  const famille = await lireFamille();
  if (!v.success || !famille) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("enfants")
    .insert({
      famille_id: famille.id,
      prenom: v.data.prenom,
      annee_naissance: v.data.anneeNaissance,
      classe: v.data.classe,
      allergies: v.data.allergies,
      gouts: v.data.gouts,
    })
    .select("id")
    .single();

  revalidatePath("/famille");
  redirect(data ? `/enfants/${data.id}` : "/famille");
}

export async function modifierEnfant(formData: FormData) {
  const id = formData.get("id");
  const v = lireFormulaireEnfant(formData);
  if (typeof id !== "string" || !v.success) return;

  const supabase = await createClient();
  await supabase
    .from("enfants")
    .update({
      prenom: v.data.prenom,
      annee_naissance: v.data.anneeNaissance ?? null,
      classe: v.data.classe ?? null,
      allergies: v.data.allergies,
      gouts: v.data.gouts ?? null,
    })
    .eq("id", id);

  revalidatePath("/famille");
  redirect(`/enfants/${id}?enregistre=1`);
}

export async function supprimerEnfant(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("enfants").delete().eq("id", id);
  revalidatePath("/famille");
  redirect("/famille");
}

export async function seDeconnecter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
