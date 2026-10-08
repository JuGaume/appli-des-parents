// Évalue la lecture des documents par l'IA sur les cas de evals/cas/.
// Lancer avec : npm run eval   (nécessite ANTHROPIC_API_KEY dans .env.local ; coûte quelques centimes)
//
// Un cas = un fichier image ou PDF + un fichier .json du même nom :
//   { "aujourdhui": "2026-10-08", "enfants": ["Léo"],
//     "attendu": [{ "titre_contient": "musée", "date": "2026-10-16", "heure_debut": "09:00" }] }
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { comparer, type ElementAttendu } from "../src/lib/ia/evaluation.ts";
import { extraireElements, type TypeMime } from "../src/lib/ia/extraction.ts";

const DOSSIER = join(import.meta.dirname, "cas");
const TYPES: Record<string, TypeMime> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".pdf": "application/pdf",
};

const fichiers = readdirSync(DOSSIER).filter((f) => TYPES[extname(f).toLowerCase()]);
let attendus = 0, trouves = 0, datesJustes = 0, extras = 0;

for (const fichier of fichiers) {
  const base = fichier.slice(0, fichier.length - extname(fichier).length);
  const cas = JSON.parse(readFileSync(join(DOSSIER, `${base}.json`), "utf8")) as {
    aujourdhui: string; enfants: string[]; attendu: ElementAttendu[];
  };
  const extraction = await extraireElements({
    donnees: readFileSync(join(DOSSIER, fichier)),
    typeMime: TYPES[extname(fichier).toLowerCase()],
    enfants: cas.enfants,
    maintenant: new Date(`${cas.aujourdhui}T12:00:00Z`),
  });
  const r = comparer(cas.attendu, extraction.elements);
  attendus += r.attendus; trouves += r.trouves; datesJustes += r.datesJustes; extras += r.extras;
  console.log(`${r.datesJustes === r.attendus && r.extras === 0 ? "OK " : "KO "} ${base}: ${r.datesJustes}/${r.attendus} dates justes, ${r.extras} en trop${r.manquants.length ? `, manquants: ${r.manquants.join(", ")}` : ""}`);
}

const pourcentage = attendus ? Math.round((100 * datesJustes) / attendus) : 0;
console.log(`\n${fichiers.length} documents · éléments trouvés ${trouves}/${attendus} · dates justes ${datesJustes}/${attendus} (${pourcentage} %) · en trop ${extras}`);
console.log("Objectif : au moins 90 % de dates justes avant d'ouvrir la bêta.");
process.exit(pourcentage >= 90 ? 0 : 1);
