import { redirect } from "next/navigation";
import { Navigation } from "@/components/Navigation";
import { createClient } from "@/lib/supabase/server";
import { seDeconnecter } from "./famille/actions";
import { LogOut } from "lucide-react";

export default async function LayoutApp({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/connexion");

  return (
    <div className="mx-auto flex min-h-dvh max-w-4xl flex-col md:flex-row">
      <Navigation />
      <div className="flex-1 pb-24 md:pb-8">
        <header className="flex items-center justify-between px-5 pt-5 md:px-8">
          <span className="text-lg font-semibold text-primary">L&apos;appli des parents</span>
          <form action={seDeconnecter}>
            <button className="btn-secondaire px-3 py-1.5 text-sm" aria-label="Se déconnecter">
              <LogOut className="size-4" aria-hidden /> Quitter
            </button>
          </form>
        </header>
        <div className="px-5 py-6 md:px-8">{children}</div>
      </div>
    </div>
  );
}
