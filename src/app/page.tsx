import Link from "next/link";
import { CalendarDays, Camera, UtensilsCrossed } from "lucide-react";

const POINTS = [
  { icone: Camera, texte: "Envoie une photo du mot de l'école, je lis les dates à ta place." },
  { icone: CalendarDays, texte: "Un agenda partagé entre les deux parents, avec les rappels qu'il faut." },
  { icone: UtensilsCrossed, texte: "Des menus selon les goûts et les allergies de chaque enfant." },
];

export default function Accueil() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-6 py-12">
      <div className="flex flex-col gap-3">
        <span className="text-lg font-semibold text-primary">L&apos;appli des parents</span>
        <h1 className="text-4xl font-semibold leading-tight">Moins de charge mentale, plus de temps en famille.</h1>
      </div>
      <ul className="flex flex-col gap-4">
        {POINTS.map(({ icone: Icone, texte }) => (
          <li key={texte} className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icone className="size-5" aria-hidden />
            </span>
            <span className="pt-2">{texte}</span>
          </li>
        ))}
      </ul>
      <Link href="/connexion" className="btn-primary">Commencer</Link>
    </main>
  );
}
