import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { FormulaireEnfant } from "@/components/FormulaireEnfant";
import { ageEnAnnees } from "@/lib/famille";
import { createClient } from "@/lib/supabase/server";
import { LIBELLES_CLASSES } from "@/lib/validation";
import { modifierEnfant, supprimerEnfant } from "../../famille/actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function FicheEnfant({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ enregistre?: string }>;
}) {
  const { id } = await params;
  const { enregistre } = await searchParams;
  if (!UUID.test(id)) notFound();

  const supabase = await createClient();
  const { data: enfant } = await supabase
    .from("enfants")
    .select("id, prenom, annee_naissance, classe, allergies, gouts")
    .eq("id", id)
    .maybeSingle();
  if (!enfant) notFound();

  const age = ageEnAnnees(enfant.annee_naissance);
  const resume = [age !== null && `${age} ans`, enfant.classe && LIBELLES_CLASSES[enfant.classe as keyof typeof LIBELLES_CLASSES]]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <Link href="/famille" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Retour
      </Link>

      <div className="flex items-center gap-4">
        <Avatar id={enfant.id} prenom={enfant.prenom} taille="lg" />
        <div>
          <h1 className="text-3xl font-semibold">{enfant.prenom}</h1>
          {resume && <p className="text-muted">{resume}</p>}
        </div>
      </div>

      {enfant.allergies.length > 0 && (
        <ul aria-label="Allergies" className="flex flex-wrap gap-2">
          {enfant.allergies.map((a: string) => (
            <li key={a} className="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">⚠ {a}</li>
          ))}
        </ul>
      )}

      {enregistre && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
          <Check className="size-4" aria-hidden /> Modifications enregistrées.
        </p>
      )}

      <section className="carte" aria-labelledby="titre-infos">
        <h2 id="titre-infos" className="mb-4 text-lg font-semibold">Informations</h2>
        <FormulaireEnfant action={modifierEnfant} enfant={enfant} libelleBouton="Enregistrer" />
      </section>

      <form action={supprimerEnfant} className="flex justify-center">
        <input type="hidden" name="id" value={enfant.id} />
        <button className="btn-danger text-sm"><Trash2 className="size-4" aria-hidden /> Supprimer cette fiche</button>
      </form>
    </div>
  );
}
