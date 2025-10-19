/**
 * Page principale de l'outil de gestion du coffre
 * Permet de voir les soldes actuels et gérer les mouvements manuels
 */

"use client";

import Navbar from "@/components/Navbar";
import SafeOverview from "@/components/safe/SafeOverview";
import SafeMovementForm from "@/components/safe/SafeMovementForm";
import SafeMovementsList from "@/components/safe/SafeMovementsList";
import SafeRecalculateButton from "@/components/safe/SafeRecalculateButton";
import { useAppStore } from "@/store/store";
import { useSafeSync } from "@/hooks/useSafeSync";
import { usePermissions } from "@/hooks/usePermissions";
import { useSafeStore } from "@/store/useSafeStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVault, faLock } from "@fortawesome/free-solid-svg-icons";

export default function SafePage() {
  const hasHydrated = useAppStore((state) => state.hasHydrated);
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);
  const isRecalculating = useSafeStore((state) => state.isRecalculating);
  const { isManagerOrAdmin } = usePermissions();

  // Synchroniser avec Firebase
  useSafeSync(selectedRestaurant?.id || "");

  if (!hasHydrated) return null;

  // Si l'utilisateur n'est pas manager ou admin, accès restreint
  if (!isManagerOrAdmin) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
            <div className="text-center py-12">
              <FontAwesomeIcon
                icon={faLock}
                className="text-muted-foreground text-6xl mb-4"
              />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Accès restreint
              </h2>
              <p className="text-muted-foreground">
                Vous n&apos;avez pas les permissions nécessaires pour accéder à
                cet outil.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Seuls les administrateurs et managers peuvent gérer le coffre.
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Container glassmorphism - Mini-App wrapper */}
        <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 dark:bg-card dark:backdrop-blur-none p-6 md:p-8 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-2xl dark:shadow-none transition-all duration-200 dark:duration-300">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
              <FontAwesomeIcon icon={faVault} className="text-primary" />
              Gestion du Coffre
            </h1>
            <p className="text-muted-foreground mt-2">
              Suivez l&apos;état du coffre et enregistrez les mouvements
              manuels (retraits, dépôts)
            </p>
          </div>

          {/* Vue d'ensemble des soldes */}
          <div className="mb-6">
            <SafeOverview />
          </div>

          {/* Loader recalcul */}
          {isRecalculating && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-xl dark:rounded-lg">
              <p className="text-primary font-semibold text-center dark:font-mono">
                ⏳ Recalcul en cours...
              </p>
            </div>
          )}

          {/* Grid : Formulaire + Liste */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Formulaire d'ajout */}
            <SafeMovementForm />

            {/* Liste des mouvements */}
            <SafeMovementsList />
          </div>

          {/* Bouton recalcul complet */}
          <div className="flex justify-center">
            <SafeRecalculateButton />
          </div>
        </div>
      </main>
    </>
  );
}
