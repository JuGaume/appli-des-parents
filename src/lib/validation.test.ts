import { describe, expect, it } from "vitest";
import { enfantSchema, lireAllergies } from "./validation";

describe("lireAllergies", () => {
  it("découpe la liste et retire les vides", () => {
    expect(lireAllergies("arachides, lait , ,")).toEqual(["arachides", "lait"]);
  });

  it("renvoie une liste vide pour un texte vide", () => {
    expect(lireAllergies("   ")).toEqual([]);
  });
});

describe("enfantSchema", () => {
  it("accepte une fiche complète", () => {
    const r = enfantSchema.parse({
      prenom: " Léo ",
      anneeNaissance: "2018",
      classe: "CE1",
      allergies: "arachides",
      gouts: "pas de poisson",
    });
    expect(r).toEqual({
      prenom: "Léo",
      anneeNaissance: 2018,
      classe: "CE1",
      allergies: ["arachides"],
      gouts: "pas de poisson",
    });
  });

  it("refuse un prénom vide", () => {
    expect(enfantSchema.safeParse({ prenom: "  ", allergies: "" }).success).toBe(false);
  });

  it("refuse une classe inconnue", () => {
    expect(enfantSchema.safeParse({ prenom: "Léo", classe: "CE7", allergies: "" }).success).toBe(false);
  });
});
