import { CalendarDays } from "lucide-react";
import { PageBientot } from "@/components/PageBientot";

export default function Agenda() {
  return <PageBientot titre="Agenda" icone={CalendarDays} texte="Les sorties, rendez-vous et papiers à rendre, au même endroit pour les deux parents." />;
}
