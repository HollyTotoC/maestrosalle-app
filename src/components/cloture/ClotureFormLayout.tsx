"use client";

import { ReactNode } from "react";
import { FormData } from "@/types/cloture";

interface ClotureFormLayoutProps {
  currentStep: number;
  totalSteps: number;
  formData: FormData;
  children: ReactNode;
  resumeCard: ReactNode;
}

/**
 * Layout pour le formulaire de clôture avec résumé temps réel
 *
 * Desktop: 60% formulaire | 40% sidebar sticky
 * Mobile: Formulaire puis résumé en dessous
 */
export default function ClotureFormLayout({
  currentStep,
  totalSteps,
  formData: _formData,
  children,
  resumeCard,
}: ClotureFormLayoutProps) {
  // Masquer le recap sidebar sur l'étape finale (step 7)
  const showResume = currentStep !== totalSteps;

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {/* Zone formulaire - 60% desktop si résumé affiché, sinon pleine largeur */}
      <div className={showResume ? "flex-1 lg:w-[60%]" : "w-full"}>
        {children}
      </div>

      {/* Zone résumé - 40% desktop, sticky - masqué sur étape finale */}
      {showResume && (
        <div className="lg:w-[40%] lg:sticky lg:top-4 lg:self-start">
          {resumeCard}
        </div>
      )}
    </div>
  );
}
