"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Home, UtensilsCrossed, type LucideIcon } from "lucide-react";

const LIENS: { href: string; libelle: string; icone: LucideIcon }[] = [
  { href: "/famille", libelle: "Famille", icone: Home },
  { href: "/agenda", libelle: "Agenda", icone: CalendarDays },
  { href: "/devoirs", libelle: "Devoirs", icone: BookOpen },
  { href: "/repas", libelle: "Repas", icone: UtensilsCrossed },
];

export function Navigation() {
  const chemin = usePathname();

  return (
    <nav
      aria-label="Menu principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:static md:w-56 md:shrink-0 md:border-t-0 md:border-r md:bg-transparent md:pb-0"
    >
      <ul className="mx-auto flex max-w-md justify-around md:max-w-none md:flex-col md:gap-1 md:p-3">
        {LIENS.map(({ href, libelle, icone: Icone }) => {
          const actif = chemin === href || (href === "/famille" && chemin.startsWith("/enfants"));
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                aria-current={actif ? "page" : undefined}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium transition md:flex-row md:gap-3 md:rounded-xl md:px-3 md:text-base ${
                  actif ? "text-primary md:bg-primary-soft" : "text-muted hover:text-foreground"
                }`}
              >
                <Icone className="size-6 md:size-5" aria-hidden />
                {libelle}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
