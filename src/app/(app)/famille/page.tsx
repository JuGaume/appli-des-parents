import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ageEnAnnees, lireFamille } from "@/lib/famille";
import { createClient } from "@/lib/supabase/server";
import { LIBELLES_CLASSES } from "@/lib/validation";
import { creerFamille } from "./actions";

export default async function Famille() {
  const famille = await lireFamille();

  if (!famille) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-5 py-10">
        <h1 className="text-3xl font-semibold">Bienvenue 👋</h1>
        <p className="text-muted">Commençons par donner un nom à ta famille. Tu pourras le changer plus tard.</p>
        <form action={creerFamille} className="flex flex-col gap-3">
          <label htmlFor="nom" className="text-sm font-medium">Nom de ta famille</label>
          <input id="nom" name="nom" required maxLength={80} placeholder="La famille Martin" className="champ" />
          <button className="btn-primary">Créer ma famille</button>
        </form>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: enfants } = await supabase
    .from("enfants")
    .select("id, prenom, annee_naissance, classe, allergies")
    .eq("famille_id", famille.id)
    .order("created_at");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">{famille.nom}</h1>

      <section aria-labelledby="titre-enfants" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 id="titre-enfants" className="text-lg font-semibold">Mes enfants</h2>
          <Link href="/enfants/nouveau" className="btn-secondaire px-3 py-1.5 text-sm">
            <Plus className="size-4" aria-hidden /> Ajouter
          </Link>
        </div>

        {enfants?.length ? (
          <ul className="flex flex-col gap-3">
            {enfants.map((e) => {
              const age = ageEnAnnees(e.annee_naissance);
              return (
                <li key={e.id}>
                  <Link href={`/enfants/${e.id}`} className="carte flex items-center gap-4 transition hover:border-primary">
                    <Avatar id={e.id} prenom={e.prenom} />
                    <span className="flex-1">
                      <strong className="block text-lg">{e.prenom}</strong>
                      <span className="text-sm text-muted">
                        {[age !== null && `${age} ans`, e.classe && LIBELLES_CLASSES[e.classe as keyof typeof LIBELLES_CLASSES]]
                          .filter(Boolean)
                          .join(" · ") || "Fiche à compléter"}
                      </span>
                    </span>
                    <ChevronRight className="size-5 text-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="carte flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-muted">Aucun enfant pour l&apos;instant.</p>
            <Link href="/enfants/nouveau" className="btn-primary">Ajouter mon premier enfant</Link>
          </div>
        )}
      </section>
    </div>
  );
}
