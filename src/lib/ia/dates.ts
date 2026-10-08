// Date et heure "d'aujourd'hui" à Paris, à donner au modèle pour comprendre
// « jeudi prochain », « le 14 », « demain »…
const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

export function aujourdhuiParis(maintenant = new Date()): { iso: string; jourSemaine: string } {
  const parties = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(maintenant);
  const lire = (type: string) => parties.find((p) => p.type === type)!.value;
  const iso = `${lire("year")}-${lire("month")}-${lire("day")}`;
  const jourSemaine = JOURS[new Date(`${iso}T12:00:00Z`).getUTCDay()];
  return { iso, jourSemaine };
}
