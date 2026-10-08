import { describe, expect, it } from "vitest";
import { aujourdhuiParis } from "./dates";
import { extractionSchema, nettoyerExtraction } from "./extraction";

const base = {
  type: "evenement" as const,
  titre: "Sortie au musée",
  date: "2026-10-16",
  heure_debut: "09:00",
  heure_fin: null,
  a_preparer: ["pique-nique", "5 €"],
  enfant: "Léo",
  certitude: "haute" as const,
};

describe("aujourdhuiParis", () => {
  it("donne la date de Paris, pas celle d'UTC (23 h UTC = lendemain à Paris)", () => {
    expect(aujourdhuiParis(new Date("2026-10-07T22:30:00Z"))).toEqual({ iso: "2026-10-08", jourSemaine: "jeudi" });
  });
  it("gère l'heure d'hiver", () => {
    expect(aujourdhuiParis(new Date("2026-12-24T23:30:00Z")).iso).toBe("2026-12-25");
  });
});

describe("extractionSchema", () => {
  it("refuse une heure invalide", () => {
    expect(extractionSchema.safeParse({ resume: "x", elements: [{ ...base, heure_debut: "25:99" }] }).success).toBe(false);
  });
  it("accepte une extraction vide", () => {
    expect(extractionSchema.safeParse({ resume: "Rien d'utile", elements: [] }).success).toBe(true);
  });
});

describe("nettoyerExtraction", () => {
  it("supprime les dates impossibles", () => {
    const r = nettoyerExtraction({ resume: "x", elements: [{ ...base, date: "2026-02-31" }] });
    expect(r.elements[0].date).toBeNull();
  });
  it("retire les doublons et les titres vides", () => {
    const r = nettoyerExtraction({ resume: "x", elements: [base, { ...base }, { ...base, titre: "   " }] });
    expect(r.elements).toHaveLength(1);
  });
  it("garde les dates valides", () => {
    expect(nettoyerExtraction({ resume: "x", elements: [base] }).elements[0].date).toBe("2026-10-16");
  });
});
