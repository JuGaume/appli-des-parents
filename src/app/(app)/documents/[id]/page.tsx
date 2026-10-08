import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { createClient } from "@/lib/supabase/server";
import { confirmerElements } from "../actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Document({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data: document } = await supabase
    .from("documents")
    .select("id, chemin, nom, type_mime, statut, resume")
    .eq("id", id)
    .maybeSingle();
  if (!document) notFound();

  const { data: elements } = await supabase
    .from("elements")
    .select("id, type, titre, date_element, heure_debut, a_preparer, certitude, statut, enfant_id")
    .eq("document_id", id)
    .order("date_element", { nullsFirst: false });

  const { data: enfants } = await supabase.from("enfants").select("id, prenom");
  const prenom = (enfantId: string | null) => enfants?.find((e) => e.id === enfantId)?.prenom;

  const apercu =
    document.type_mime !== "application/pdf"
      ? (await supabase.storage.from("documents").createSignedUrl(document.chemin, 300)).data?.signedUrl
      : undefined;

  const aConfirmer = (elements ?? []).filter((e) => e.statut === "propose");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <Link href="/envoyer" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Envoyer un autre document
      </Link>

      <h1 className="text-2xl font-semibold">Ce que j&apos;ai compris</h1>

      {apercu && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={apercu} alt={`Document envoyé : ${document.nom}`} className="max-h-48 w-full rounded-xl border border-border object-cover object-top" />
      )}

      {document.statut === "erreur" && (
        <div role="alert" className="carte flex flex-col gap-3">
          <p className="flex items-center gap-2 font-medium"><AlertTriangle className="size-5 text-danger" aria-hidden /> Je n&apos;ai pas réussi à lire ce document.</p>
          <p className="text-sm text-muted">La photo est peut-être floue ou trop sombre. Réessaie avec une photo bien cadrée.</p>
          <Link href="/envoyer" className="btn-primary">Réessayer</Link>
        </div>
      )}

      {document.statut === "traite" && document.resume && <p className="text-muted">{document.resume}</p>}

      {document.statut === "traite" && (elements ?? []).length === 0 && (
        <div className="carte text-center text-muted">Je n&apos;ai rien trouvé à retenir dans ce document.</div>
      )}

      {aConfirmer.length > 0 && (
        <form action={confirmerElements} className="flex flex-col gap-4">
          <input type="hidden" name="documentId" value={document.id} />
          <p className="text-sm text-muted">Décoche ce qui est faux, corrige ce qui doit l&apos;être, puis ajoute à l&apos;agenda.</p>
          <ul className="flex flex-col gap-3">
            {aConfirmer.map((e) => (
              <li key={e.id} className="carte flex flex-col gap-3">
                <label className="flex items-center gap-3 font-medium">
                  <input type="checkbox" name={`garder_${e.id}`} defaultChecked className="size-5 accent-[var(--primary)]" />
                  <span>{e.type === "tache" ? "À faire" : "Événement"}{prenom(e.enfant_id) && ` · ${prenom(e.enfant_id)}`}</span>
                  {e.certitude === "faible" && <span className="ml-auto rounded-full bg-primary-soft px-2 py-0.5 text-xs text-danger">À vérifier</span>}
                </label>
                <input name={`titre_${e.id}`} defaultValue={e.titre} aria-label="Titre" maxLength={200} className="champ" />
                <div className="grid grid-cols-2 gap-3">
                  <input name={`date_${e.id}`} type="date" defaultValue={e.date_element ?? ""} aria-label="Date" className="champ" />
                  <input name={`heure_${e.id}`} type="time" defaultValue={e.heure_debut?.slice(0, 5) ?? ""} aria-label="Heure" className="champ" />
                </div>
                <input name={`preparer_${e.id}`} defaultValue={e.a_preparer.join(", ")} aria-label="À préparer" placeholder="À préparer (pique-nique, 5 €…)" className="champ" />
              </li>
            ))}
          </ul>
          <BoutonEnvoi libelle="Ajouter à l'agenda" libelleEnCours="Ajout…" />
        </form>
      )}

      {aConfirmer.length === 0 && (elements ?? []).length > 0 && (
        <Link href="/agenda" className="btn-primary">Voir l&apos;agenda</Link>
      )}
    </div>
  );
}
