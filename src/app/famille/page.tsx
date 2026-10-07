import { createClient } from "@/lib/supabase/server";
import { CLASSES, LIBELLES_CLASSES } from "@/lib/validation";
import { ajouterEnfant, creerFamille, seDeconnecter, supprimerEnfant } from "./actions";

const champ = "rounded-lg border px-3 py-2";
const bouton = "rounded-lg bg-black px-4 py-2 text-white";

export default async function Famille() {
  const supabase = await createClient();
  const { data: familles } = await supabase.from("familles").select("id, nom").limit(1);
  const famille = familles?.[0];

  if (!famille) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
        <h1 className="text-2xl font-semibold">Bienvenue</h1>
        <form action={creerFamille} className="flex flex-col gap-3">
          <label htmlFor="nom">Nom de ta famille</label>
          <input id="nom" name="nom" required maxLength={80} placeholder="La famille Martin" className={champ} />
          <button className={bouton}>Créer ma famille</button>
        </form>
      </main>
    );
  }

  const { data: enfants } = await supabase
    .from("enfants")
    .select("id, prenom, classe, allergies")
    .eq("famille_id", famille.id)
    .order("created_at");

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{famille.nom}</h1>
        <form action={seDeconnecter}><button className="text-sm underline">Se déconnecter</button></form>
      </header>

      <section aria-labelledby="enfants" className="flex flex-col gap-3">
        <h2 id="enfants" className="text-lg font-medium">Mes enfants</h2>
        {enfants?.length ? (
          <ul className="flex flex-col gap-2">
            {enfants.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                <span>
                  <strong>{e.prenom}</strong>
                  {e.classe && ` · ${LIBELLES_CLASSES[e.classe as keyof typeof LIBELLES_CLASSES]}`}
                  {e.allergies.length > 0 && <em className="block text-sm">Allergies : {e.allergies.join(", ")}</em>}
                </span>
                <form action={supprimerEnfant}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="text-sm underline" aria-label={`Supprimer ${e.prenom}`}>Supprimer</button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun enfant pour l&apos;instant.</p>
        )}
      </section>

      <form action={ajouterEnfant} className="flex flex-col gap-3 rounded-lg border p-4">
        <h2 className="text-lg font-medium">Ajouter un enfant</h2>
        <input name="prenom" required maxLength={40} placeholder="Prénom" aria-label="Prénom" className={champ} />
        <input name="anneeNaissance" type="number" min={2005} placeholder="Année de naissance" aria-label="Année de naissance" className={champ} />
        <select name="classe" aria-label="Classe" defaultValue="" className={champ}>
          <option value="">Classe (facultatif)</option>
          {CLASSES.map((c) => <option key={c} value={c}>{LIBELLES_CLASSES[c]}</option>)}
        </select>
        <input name="allergies" placeholder="Allergies, séparées par des virgules" aria-label="Allergies" className={champ} />
        <input name="gouts" maxLength={500} placeholder="Goûts (ex. : ne mange pas de poisson)" aria-label="Goûts" className={champ} />
        <button className={bouton}>Ajouter</button>
      </form>
    </main>
  );
}
