import type { LucideIcon } from "lucide-react";

export function PageBientot({ titre, icone: Icone, texte }: { titre: string; icone: LucideIcon; texte: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icone className="size-8" aria-hidden />
      </span>
      <h1 className="text-2xl font-semibold">{titre}</h1>
      <p className="max-w-xs text-muted">{texte}</p>
      <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-primary">Bientôt disponible</span>
    </div>
  );
}
