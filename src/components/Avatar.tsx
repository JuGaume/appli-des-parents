import { couleurAvatar } from "@/lib/famille";

export function Avatar({ id, prenom, taille = "md" }: { id: string; prenom: string; taille?: "md" | "lg" }) {
  const dimensions = taille === "lg" ? "size-20 text-3xl" : "size-12 text-xl";
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${dimensions} ${couleurAvatar(id)}`}
    >
      {prenom.trim().charAt(0).toUpperCase()}
    </span>
  );
}
