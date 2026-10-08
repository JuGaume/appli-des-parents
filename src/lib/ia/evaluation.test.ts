import { describe, expect, it } from "vitest";
import type { ElementExtrait } from "./extraction";
import { comparer } from "./evaluation";

const musee: ElementExtrait = {
  type: "evenement", titre: "Sortie au Musée", date: "2026-10-16", heure_debut: "09:00",
  heure_fin: null, a_preparer: [], enfant: null, certitude: "haute",
};

describe("comparer", () => {
  it("trouve un élément sans tenir compte des accents ni de la casse", () => {
    const r = comparer([{ titre_contient: "musee", date: "2026-10-16", heure_debut: "09:00" }], [musee]);
    expect(r).toMatchObject({ trouves: 1, datesJustes: 1, extras: 0, manquants: [] });
  });
  it("compte une mauvaise date comme fausse mais l'élément comme trouvé", () => {
    const r = comparer([{ titre_contient: "musée", date: "2026-10-17" }], [musee]);
    expect(r).toMatchObject({ trouves: 1, datesJustes: 0 });
  });
  it("signale les manquants et les éléments en trop", () => {
    const r = comparer([{ titre_contient: "piscine", date: null }], [musee]);
    expect(r).toMatchObject({ trouves: 0, extras: 1, manquants: ["piscine"] });
  });
});
