import { redirect } from "next/navigation";
import { Camera } from "lucide-react";
import { BoutonEnvoi } from "@/components/BoutonEnvoi";
import { lireFamille } from "@/lib/famille";
import { envoyerDocument } from "../documents/actions";

// La lecture par l'IA peut prendre plusieurs secondes.
export const maxDuration = 60;

const MESSAGES: Record<string, string> = {
  "aucun-fichier": "Choisis d'abord une photo ou un PDF.",
  "trop-gros": "Ce fichier dépasse 10 Mo. Essaie avec une photo plus légère.",
  format: "Ce format n'est pas pris en charge. Envoie une photo (JPEG, PNG, WebP) ou un PDF.",
  stockage: "L'enregistrement du fichier a échoué. Réessaie dans un instant.",
};

export default async function Envoyer({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  if (!(await lireFamille())) redirect("/famille");
  const { erreur } = await searchParams;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-3xl font-semibold">Envoyer un document</h1>
        <p className="mt-1 text-muted">
          Une photo du mot de l&apos;école, une circulaire en PDF… Je lis les dates et ce qu&apos;il faut préparer, tu confirmes.
        </p>
      </div>

      {erreur && MESSAGES[erreur] && (
        <p role="alert" className="rounded-xl bg-primary-soft px-3 py-2 text-sm text-danger">{MESSAGES[erreur]}</p>
      )}

      <form action={envoyerDocument} className="carte flex flex-col gap-4">
        <label
          htmlFor="fichier"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-10 text-center transition hover:border-primary"
        >
          <Camera className="size-8 text-primary" aria-hidden />
          <span className="font-medium">Prendre une photo ou choisir un fichier</span>
          <span className="text-sm text-muted">JPEG, PNG, WebP ou PDF, 10 Mo maximum</span>
        </label>
        <input id="fichier" name="fichier" type="file" required accept="image/*,application/pdf" className="text-sm" />
        <BoutonEnvoi libelle="Lire le document" libelleEnCours="Lecture en cours…" />
      </form>

      <p className="text-center text-sm text-muted">
        Je suis une IA : je peux me tromper, vérifie toujours les dates avant de confirmer.
      </p>
    </div>
  );
}
