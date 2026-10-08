// Faux serveur Anthropic pour les tests de bout en bout : aucune clé, aucun coût.
// Répond toujours avec la même extraction (une sortie scolaire et une autorisation à signer).
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

const EXTRACTION = {
  resume: "Mot de l'école : sortie au musée et autorisation à signer.",
  elements: [
    {
      type: "evenement",
      titre: "Sortie au musée",
      date: "2099-10-16",
      heure_debut: "09:00",
      heure_fin: null,
      a_preparer: ["pique-nique", "5 €"],
      enfant: "Léo",
      certitude: "haute",
    },
    {
      type: "tache",
      titre: "Rapporter l'autorisation signée",
      date: "2099-10-15",
      heure_debut: null,
      heure_fin: null,
      a_preparer: [],
      enfant: null,
      certitude: "moyenne",
    },
  ],
};

export type RequeteRecue = { url?: string; corps: unknown };

export function demarrerFausseIA(port = 4010): Promise<{ serveur: Server; requetes: RequeteRecue[]; port: number }> {
  const requetes: RequeteRecue[] = [];
  const serveur = createServer((req, res) => {
    let corps = "";
    req.on("data", (morceau) => (corps += morceau));
    req.on("end", () => {
      requetes.push({ url: req.url, corps: corps ? JSON.parse(corps) : null });
      res.setHeader("content-type", "application/json");
      res.end(
        JSON.stringify({
          id: "msg_test",
          type: "message",
          role: "assistant",
          model: "claude-haiku-5-5",
          content: [{ type: "text", text: JSON.stringify(EXTRACTION) }],
          stop_reason: "end_turn",
          stop_sequence: null,
          usage: { input_tokens: 10, output_tokens: 10 },
        }),
      );
    });
  });
  return new Promise((resolve) => serveur.listen(port, () => resolve({ serveur, requetes, port: (serveur.address() as AddressInfo).port })));
}
