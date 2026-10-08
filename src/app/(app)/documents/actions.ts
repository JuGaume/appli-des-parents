"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { lireFamille } from "@/lib/famille";
import { extraireElements, TYPES_MIME_ACCEPTES, type TypeMime } from "@/lib/ia/extraction";
import { createClient } from "@/lib/supabase/server";

const TAILLE_MAX = 10 * 1024 * 1024;
const EXTENSIONS: Record<TypeMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

function erreurEnvoi(code: string): never {
  redirect(`/envoyer?erreur=${code}`);
}

export async function envoyerDocument(formData: FormData) {
  const fichier = formData.get("fichier");
  if (!(fichier instanceof File) || fichier.size === 0) erreurEnvoi("aucun-fichier");
  if (fichier.size > TAILLE_MAX) erreurEnvoi("trop-gros");
  const typeMime = TYPES_MIME_ACCEPTES.find((t) => t === fichier.type);
  if (!typeMime) erreurEnvoi("format");

  const famille = await lireFamille();
  if (!famille) redirect("/famille");

  const supabase = await createClient();
  const donnees = Buffer.from(await fichier.arrayBuffer());
  const chemin = `${famille.id}/${randomUUID()}.${EXTENSIONS[typeMime]}`;

  const { error: erreurStockage } = await supabase.storage
    .from("documents")
    .upload(chemin, donnees, { contentType: typeMime });
  if (erreurStockage) erreurEnvoi("stockage");

  const { data: document } = await supabase
    .from("documents")
    .insert({ famille_id: famille.id, chemin, nom: fichier.name.slice(0, 200) || "document", type_mime: typeMime })
    .select("id")
    .single();
  if (!document) {
    await supabase.storage.from("documents").remove([chemin]);
    erreurEnvoi("stockage");
  }

  const { data: enfants } = await supabase.from("enfants").select("id, prenom").eq("famille_id", famille.id);

  try {
    const extraction = await extraireElements({
      donnees,
      typeMime,
      enfants: (enfants ?? []).map((e) => e.prenom),
    });

    if (extraction.elements.length > 0) {
      await supabase.from("elements").insert(
        extraction.elements.map((e) => ({
          famille_id: famille.id,
          document_id: document.id,
          type: e.type,
          titre: e.titre,
          date_element: e.date,
          heure_debut: e.heure_debut,
          heure_fin: e.heure_fin,
          a_preparer: e.a_preparer,
          enfant_id: (enfants ?? []).find((c) => c.prenom.toLowerCase() === e.enfant?.toLowerCase())?.id ?? null,
          certitude: e.certitude,
        })),
      );
    }
    await supabase.from("documents").update({ statut: "traite", resume: extraction.resume }).eq("id", document.id);
  } catch (e) {
    // Jamais le contenu du document dans les journaux : seulement l'identifiant et le type d'erreur.
    console.error("extraction échouée", { documentId: document.id, erreur: e instanceof Error ? e.name : "inconnue" });
    await supabase.from("documents").update({ statut: "erreur" }).eq("id", document.id);
  }

  revalidatePath("/agenda");
  redirect(`/documents/${document.id}`);
}

export async function confirmerElements(formData: FormData) {
  const documentId = formData.get("documentId");
  if (typeof documentId !== "string") return;

  const supabase = await createClient();
  const { data: elements } = await supabase.from("elements").select("id").eq("document_id", documentId);

  for (const { id } of elements ?? []) {
    const garder = formData.get(`garder_${id}`) === "on";
    const titre = String(formData.get(`titre_${id}`) ?? "").trim().slice(0, 200);
    const date = String(formData.get(`date_${id}`) ?? "");
    const heure = String(formData.get(`heure_${id}`) ?? "");
    const aPreparer = String(formData.get(`preparer_${id}`) ?? "")
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)
      .slice(0, 10);

    if (!garder || !titre) {
      await supabase.from("elements").update({ statut: "ignore" }).eq("id", id);
      continue;
    }
    await supabase
      .from("elements")
      .update({
        statut: "confirme",
        titre,
        date_element: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null,
        heure_debut: /^([01]\d|2[0-3]):[0-5]\d$/.test(heure) ? heure : null,
        a_preparer: aPreparer,
      })
      .eq("id", id);
  }

  revalidatePath("/agenda");
  redirect("/agenda?ajoute=1");
}
