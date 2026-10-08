import { CLASSES, LIBELLES_CLASSES } from "@/lib/validation";

type Enfant = {
  id: string;
  prenom: string;
  annee_naissance: number | null;
  classe: string | null;
  allergies: string[];
  gouts: string | null;
};

function Champ({ id, libelle, children }: { id: string; libelle: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{libelle}</label>
      {children}
    </div>
  );
}

export function FormulaireEnfant({
  action,
  enfant,
  libelleBouton,
}: {
  action: (formData: FormData) => void | Promise<void>;
  enfant?: Enfant;
  libelleBouton: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4">
      {enfant && <input type="hidden" name="id" value={enfant.id} />}
      <Champ id="prenom" libelle="Prénom">
        <input id="prenom" name="prenom" required maxLength={40} defaultValue={enfant?.prenom} className="champ" />
      </Champ>
      <div className="grid grid-cols-2 gap-3">
        <Champ id="classe" libelle="Classe">
          <select id="classe" name="classe" defaultValue={enfant?.classe ?? ""} className="champ">
            <option value="">Non précisée</option>
            {CLASSES.map((c) => <option key={c} value={c}>{LIBELLES_CLASSES[c]}</option>)}
          </select>
        </Champ>
        <Champ id="anneeNaissance" libelle="Année de naissance">
          <input
            id="anneeNaissance" name="anneeNaissance" type="number" inputMode="numeric" min={2005}
            max={new Date().getFullYear()} defaultValue={enfant?.annee_naissance ?? ""} className="champ"
          />
        </Champ>
      </div>
      <Champ id="allergies" libelle="Allergies (séparées par des virgules)">
        <input id="allergies" name="allergies" defaultValue={enfant?.allergies.join(", ")} placeholder="arachides, lait" className="champ" />
      </Champ>
      <Champ id="gouts" libelle="Goûts et dégoûts">
        <textarea id="gouts" name="gouts" rows={3} maxLength={500} defaultValue={enfant?.gouts ?? ""} placeholder="Ne mange pas de poisson, adore les pâtes" className="champ" />
      </Champ>
      <button className="btn-primary">{libelleBouton}</button>
    </form>
  );
}
