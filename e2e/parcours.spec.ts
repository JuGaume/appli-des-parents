import { expect, test, type Page } from "@playwright/test";
import { demarrerFausseIA } from "./fausse-ia";

const BOITE_MAIL = "http://127.0.0.1:54324";
// Un PNG de 1 pixel : la fausse IA ne le lit pas.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);

async function lienDeConnexion(email: string): Promise<string> {
  for (let essai = 0; essai < 20; essai++) {
    const liste = await (await fetch(`${BOITE_MAIL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`)).json();
    const message = liste.messages?.[0];
    if (message) {
      const detail = await (await fetch(`${BOITE_MAIL}/api/v1/message/${message.ID}`)).json();
      const lien = /https?:\/\/[^\s"'<>]+\/auth\/v1\/verify[^\s"'<>]+/.exec(`${detail.HTML} ${detail.Text}`);
      if (lien) return lien[0].replaceAll("&amp;", "&");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Aucun mail de connexion reçu");
}

// CAPTURES=dossier : enregistre des captures d'écran au format téléphone pour relire le design.
async function capture(page: Page, nom: string) {
  if (process.env.CAPTURES) await page.screenshot({ path: `${process.env.CAPTURES}/${nom}.png`, fullPage: true });
}

test.use({ viewport: { width: 390, height: 800 } });

test("connexion, famille, enfant, document lu par l'IA, confirmation, agenda", async ({ page }) => {
  const { serveur, requetes } = await demarrerFausseIA();
  const email = `parent-${Date.now()}@test.fr`;

  try {
    // Connexion par lien magique
    await page.goto("/connexion");
    await page.getByLabel("Ton adresse e-mail").fill(email);
    await page.getByRole("button", { name: "Recevoir mon lien" }).click();
    await expect(page.getByText("Un lien de connexion vient d'être envoyé")).toBeVisible();
    await page.goto(await lienDeConnexion(email));

    // Famille et enfant
    await expect(page.getByRole("heading", { name: /Bienvenue/ })).toBeVisible();
    await page.getByLabel("Nom de ta famille").fill("La famille Test");
    await page.getByRole("button", { name: "Créer ma famille" }).click();
    await capture(page, "1-bienvenue");
    await page.getByRole("link", { name: "Ajouter mon premier enfant" }).click();
    await page.getByLabel("Prénom").fill("Léo");
    await page.getByLabel("Classe").selectOption("CE1");
    await page.getByLabel(/Allergies/).fill("arachides");
    await page.getByRole("button", { name: "Ajouter" }).click();
    await expect(page.getByRole("heading", { name: "Léo" })).toBeVisible();
    await capture(page, "2-fiche-enfant");

    // Envoi d'un document
    await page.getByRole("link", { name: "Envoyer", exact: true }).first().click();
    await page.locator("#fichier").setInputFiles({ name: "mot.png", mimeType: "image/png", buffer: PNG });
    await page.getByRole("button", { name: "Lire le document" }).click();

    // Carte de confirmation
    await expect(page.getByRole("heading", { name: "Ce que j'ai compris" })).toBeVisible();
    await expect(page.getByLabel("Titre").first()).toHaveValue("Rapporter l'autorisation signée");
    await expect(page.getByLabel("Titre").nth(1)).toHaveValue("Sortie au musée");
    await capture(page, "3-confirmation");
    // On décoche la tâche, on garde l'événement
    await page.getByRole("checkbox").first().uncheck();
    await page.getByLabel("Titre").nth(1).fill("Sortie au musée d'histoire");
    await page.getByRole("button", { name: "Ajouter à l'agenda" }).click();

    // Agenda : seul l'élément confirmé apparaît
    await expect(page.getByText("C'est ajouté à l'agenda.")).toBeVisible();
    await expect(page.getByText("Sortie au musée d'histoire")).toBeVisible();
    await expect(page.getByText("pique-nique")).toBeVisible();
    await expect(page.getByText("Rapporter l'autorisation signée")).toHaveCount(0);
    await capture(page, "4-agenda");

    // L'IA a reçu la date du jour, les prénoms et le document, et aucune clé n'a fuité dans la page
    const appel = requetes.find((r) => r.url?.includes("/v1/messages"));
    expect(JSON.stringify(appel?.corps)).toContain("Léo");
    expect(JSON.stringify(appel?.corps)).toContain("Date du jour");
    expect(await page.content()).not.toContain("cle-de-test");
  } finally {
    serveur.close();
  }
});
