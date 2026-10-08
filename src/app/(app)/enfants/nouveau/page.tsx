import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FormulaireEnfant } from "@/components/FormulaireEnfant";
import { ajouterEnfant } from "../../famille/actions";

export default function NouvelEnfant() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <Link href="/famille" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Retour
      </Link>
      <h1 className="text-2xl font-semibold">Ajouter un enfant</h1>
      <div className="carte">
        <FormulaireEnfant action={ajouterEnfant} libelleBouton="Ajouter" />
      </div>
    </div>
  );
}
