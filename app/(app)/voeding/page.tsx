import { Utensils } from "lucide-react";
import { ComingSoon } from "@/components/shared/ComingSoon";

export default function VoedingPage() {
  return (
    <ComingSoon
      icon={Utensils}
      title="Voeding"
      description="Je voedingsdagboek, recepten en barcode scannen komen in fase 2."
    />
  );
}
