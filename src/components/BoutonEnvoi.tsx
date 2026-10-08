"use client";

import { useFormStatus } from "react-dom";
import { Loader2, Sparkles } from "lucide-react";

export function BoutonEnvoi({ libelle, libelleEnCours }: { libelle: string; libelleEnCours: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary" disabled={pending} aria-busy={pending}>
      {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Sparkles className="size-5" aria-hidden />}
      {pending ? libelleEnCours : libelle}
    </button>
  );
}
