import { describe, expect, it } from "vitest";
import { ageEnAnnees, couleurAvatar } from "./famille";

describe("ageEnAnnees", () => {
  it("calcule l'âge à partir de l'année de naissance", () => {
    expect(ageEnAnnees(2018, 2026)).toBe(8);
  });
  it("renvoie null sans année de naissance", () => {
    expect(ageEnAnnees(null)).toBeNull();
  });
});

describe("couleurAvatar", () => {
  it("donne toujours la même couleur pour un même enfant", () => {
    expect(couleurAvatar("abc")).toBe(couleurAvatar("abc"));
  });
});
