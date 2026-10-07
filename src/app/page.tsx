import Link from "next/link";

export default function Accueil() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-semibold">L&apos;appli des parents</h1>
      <p>Envoie-moi les mails de l&apos;école, je m&apos;occupe du reste.</p>
      <Link href="/connexion" className="rounded-lg bg-black px-4 py-2 text-center text-white">Commencer</Link>
    </main>
  );
}
