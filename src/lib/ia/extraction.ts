import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type Anthropic from "@anthropic-ai/sdk";
import { clientIA, MODELE_EXTRACTION } from "./client";
import { aujourdhuiParis } from "./dates";
import { promptSysteme, promptUtilisateur } from "./prompts/extraction";

export const TYPES_MIME_ACCEPTES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
] as const;
export type TypeMime = (typeof TYPES_MIME_ACCEPTES)[number];

const dateIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const heure = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const elementSchema = z.object({
  type: z.enum(["evenement", "tache"]),
  titre: z.string(),
  date: dateIso.nullable(),
  heure_debut: heure.nullable(),
  heure_fin: heure.nullable(),
  a_preparer: z.array(z.string()),
  enfant: z.string().nullable(),
  certitude: z.enum(["haute", "moyenne", "faible"]),
});

export const extractionSchema = z.object({
  resume: z.string(),
  elements: z.array(elementSchema),
});

export type Extraction = z.infer<typeof extractionSchema>;
export type ElementExtrait = z.infer<typeof elementSchema>;

// Nettoie ce que renvoie le modèle avant d'écrire en base :
// dates impossibles (31 février), titres vides, doublons exacts.
export function nettoyerExtraction(brut: Extraction): Extraction {
  const vus = new Set<string>();
  const elements = brut.elements
    .map((e) => ({
      ...e,
      titre: e.titre.trim().slice(0, 200),
      date: e.date && !Number.isNaN(Date.parse(`${e.date}T12:00:00Z`)) && new Date(`${e.date}T12:00:00Z`).toISOString().startsWith(e.date) ? e.date : null,
      a_preparer: e.a_preparer.map((a) => a.trim()).filter(Boolean).slice(0, 10),
    }))
    .filter((e) => e.titre.length > 0)
    .filter((e) => {
      const cle = `${e.type}|${e.titre.toLowerCase()}|${e.date}|${e.heure_debut}`;
      if (vus.has(cle)) return false;
      vus.add(cle);
      return true;
    });
  return { resume: brut.resume.trim().slice(0, 500), elements };
}

function blocDocument(donnees: Buffer, typeMime: TypeMime): Anthropic.ContentBlockParam {
  const data = donnees.toString("base64");
  if (typeMime === "application/pdf") {
    return { type: "document", source: { type: "base64", media_type: "application/pdf", data } };
  }
  return { type: "image", source: { type: "base64", media_type: typeMime, data } };
}

export async function extraireElements(args: {
  donnees: Buffer;
  typeMime: TypeMime;
  enfants: string[];
  maintenant?: Date;
}): Promise<Extraction> {
  const { iso, jourSemaine } = aujourdhuiParis(args.maintenant);

  const reponse = await clientIA().messages.parse({
    model: MODELE_EXTRACTION,
    max_tokens: 4000,
    system: promptSysteme(),
    messages: [
      {
        role: "user",
        content: [
          blocDocument(args.donnees, args.typeMime),
          { type: "text", text: promptUtilisateur({ aujourdhui: iso, jourSemaine, enfants: args.enfants }) },
        ],
      },
    ],
    output_config: { effort: "low", format: zodOutputFormat(extractionSchema) },
  });

  if (reponse.stop_reason === "refusal" || !reponse.parsed_output) {
    throw new Error("Lecture du document impossible");
  }
  return nettoyerExtraction(reponse.parsed_output);
}
