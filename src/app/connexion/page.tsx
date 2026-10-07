"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { emailSchema } from "@/lib/validation";

export default function Connexion() {
  const [email, setEmail] = useState("");
  const [etat, setEtat] = useState<"saisie" | "envoye">("saisie");
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const v = emailSchema.safeParse(email.trim());
    if (!v.success) return setErreur(v.error.issues[0].message);

    const { error } = await createClient().auth.signInWithOtp({
      email: v.data,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) return setErreur("Impossible d'envoyer le lien. Réessaie dans un instant.");
    setEtat("envoye");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Connexion</h1>
      {etat === "envoye" ? (
        <p>Un lien de connexion vient d&apos;être envoyé à <strong>{email}</strong>. Ouvre-le sur ce téléphone.</p>
      ) : (
        <form onSubmit={envoyer} className="flex flex-col gap-3">
          <label htmlFor="email">Ton adresse e-mail</label>
          <input
            id="email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border px-3 py-2"
          />
          {erreur && <p role="alert" className="text-red-600">{erreur}</p>}
          <button className="rounded-lg bg-black px-4 py-2 text-white">Recevoir mon lien</button>
        </form>
      )}
    </main>
  );
}
