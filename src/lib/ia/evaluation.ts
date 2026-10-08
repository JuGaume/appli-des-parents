import type { ElementExtrait } from "./extraction";

export type ElementAttendu = {
  titre_contient: string;
  date: string | null;
  heure_debut?: string | null;
};

export type ResultatCas = {
  trouves: number;
  attendus: number;
  datesJustes: number;
  extras: number;
  manquants: string[];
};

function simplifier(texte: string) {
  return texte.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

// Compare ce que l'IA a extrait avec ce qu'un humain attendait.
// Un élément est « trouvé » si un élément extrait contient le mot-clé du titre ;
// sa date est « juste » si elle est identique (et l'heure aussi, quand elle est attendue).
export function comparer(attendus: ElementAttendu[], extraits: ElementExtrait[]): ResultatCas {
  const restants = [...extraits];
  let trouves = 0;
  let datesJustes = 0;
  const manquants: string[] = [];

  for (const a of attendus) {
    const i = restants.findIndex((e) => simplifier(e.titre).includes(simplifier(a.titre_contient)));
    if (i === -1) {
      manquants.push(a.titre_contient);
      continue;
    }
    const [e] = restants.splice(i, 1);
    trouves++;
    const heureOk = a.heure_debut === undefined || a.heure_debut === e.heure_debut;
    if (e.date === a.date && heureOk) datesJustes++;
  }

  return { trouves, attendus: attendus.length, datesJustes, extras: restants.length, manquants };
}
