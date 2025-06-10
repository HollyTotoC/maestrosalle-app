import { Separator } from "@/components/ui/separator";
import React from "react";

/**
 * Affiche une pile de séparateurs visuels pour marquer une section.
 * Personnalisez les classes ou le nombre de séparateurs si besoin.
 */
export function SectionSeparatorStack({ space = 4, className = "" }: { space?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-1 my-${space} ${className}`}>
      <Separator className="borders" />
      <Separator className="border-[2px]" />
      <Separator className="border-[3px]" />
    </div>
  );
}
