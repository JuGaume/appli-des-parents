"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { enfantSchema, familleSchema } from "@/lib/validation";

export async function creerFamille(formData: FormData) {
  const v = familleSchema.safeParse({ nom: formData.get("nom") });
  if (!v.success) return;

  const supabase = await createClient();
  await supabase.rpc("creer_famille", { nom: v.data.nom });
  revalidatePath("/famille");
}

export async function ajouterEnfant(formData: FormData) {
  const v = enfantSchema.safeParse({
    prenom: formData.get("prenom"),
    anneeNaissance: formData.get("anneeNaissance") || undefined,
    classe: formData.get("classe") || undefined,
    allergies: formData.get("allergies") ?? "",
    gouts: formData.get("gouts") || undefined,
  });
  if (!v.success) return;

  const supabase = await createClient();
  const { data: membre } = await supabase.from("membres").select("famille_id").limit(1).single();
  if (!membre) return;

  await supabase.from("enfants").insert({
    famille_id: membre.famille_id,
    prenom: v.data.prenom,
    annee_naissance: v.data.anneeNaissance,
    classe: v.data.classe,
    allergies: v.data.allergies,
    gouts: v.data.gouts,
  });
  revalidatePath("/famille");
}

export async function supprimerEnfant(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = await createClient();
  await supabase.from("enfants").delete().eq("id", id);
  revalidatePath("/famille");
}

export async function seDeconnecter() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
