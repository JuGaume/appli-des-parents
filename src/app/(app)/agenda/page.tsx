import Link from "next/link";
import { Camera, Check, CalendarDays } from "lucide-react";
import { aujourdhuiParis } from "@/lib/ia/dates";
import { createClient } from "@/lib/supabase/server";

function titreJour(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })
    .format(new Date(`${iso}T12:00:00Z`));
}

export default async function Agenda({ searchParams }: { searchParams: Promise<{ ajoute?: string }> }) {
  const { ajoute } = await searchParams;
  const { iso: aujourdhui } = aujourdhuiParis();
  const supabase = await createClient();

  const { data } = await supabase
    .from("elements")
    .select("id, type, titre, date_element, heure_debut, a_preparer, enfant_id")
    .eq("statut", "confirme")
    .or(`date_element.gte.${aujourdhui},date_element.is.null`)
    .order("date_element", { nullsFirst: false })
    .order("heure_debut", { nullsFirst: true });
  const { data: enfants } = await supabase.from("enfants").select("id, prenom");

  const elements = data ?? [];
  const sansDate = elements.filter((e) => !e.date_element);
  const jours = new Map<string, typeof elements>();
  for (const e of elements.filter((e) => e.date_element)) {
    jours.set(e.date_element!, [...(jours.get(e.date_element!) ?? []), e]);
  }

  const ligne = (e: (typeof elements)[number]) => (
    <li key={e.id} className="carte flex flex-col gap-1">
      <span className="flex items-center gap-2">
        {e.heure_debut && <span className="rounded-md bg-primary-soft px-2 py-0.5 text-sm font-medium text-primary">{e.heure_debut.slice(0, 5)}</span>}
        <strong>{e.titre}</strong>
      </span>
      <span className="text-sm text-muted">
        {[e.type === "tache" && "À faire", enfants?.find((c) => c.id === e.enfant_id)?.prenom, ...e.a_preparer]
          .filter(Boolean)
          .join(" · ")}
      </span>
    </li>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Agenda</h1>
        <Link href="/envoyer" className="btn-secondaire px-3 py-1.5 text-sm"><Camera className="size-4" aria-hidden /> Envoyer</Link>
      </div>

      {ajoute && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-2 text-sm text-emerald-900">
          <Check className="size-4" aria-hidden /> C&apos;est ajouté à l&apos;agenda.
        </p>
      )}

      {elements.length === 0 && (
        <div className="carte flex flex-col items-center gap-3 py-10 text-center">
          <CalendarDays className="size-8 text-primary" aria-hidden />
          <p className="text-muted">Rien à venir pour l&apos;instant. Envoie le mot de l&apos;école, je m&apos;occupe des dates.</p>
          <Link href="/envoyer" className="btn-primary">Envoyer un document</Link>
        </div>
      )}

      {[...jours.entries()].map(([jour, liste]) => (
        <section key={jour} className="flex flex-col gap-2" aria-label={titreJour(jour)}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {jour === aujourdhui ? "Aujourd'hui · " : ""}{titreJour(jour)}
          </h2>
          <ul className="flex flex-col gap-2">{liste.map(ligne)}</ul>
        </section>
      ))}

      {sansDate.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Sans date">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Sans date précise</h2>
          <ul className="flex flex-col gap-2">{sansDate.map(ligne)}</ul>
        </section>
      )}
    </div>
  );
}
