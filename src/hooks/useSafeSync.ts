/**
 * Hook pour synchroniser le store Safe avec Firebase en temps réel
 * Écoute les changements sur safeState et safeMovements
 */

import { useEffect } from "react";
import { useSafeStore } from "@/store/useSafeStore";
import {
  listenToSafeState,
  listenToSafeMovements,
  calculateSafeState,
} from "@/lib/firebase/safeOperations";

/**
 * Hook de synchronisation pour un restaurant spécifique
 * @param restaurantId - ID du restaurant à synchroniser
 * @param autoCalculate - Si true, calcule automatiquement l'état au premier chargement
 */
export function useSafeSync(restaurantId: string, autoCalculate = true) {
  const setSafeState = useSafeStore((state) => state.setSafeState);
  const setMovements = useSafeStore((state) => state.setMovements);
  const setIsLoading = useSafeStore((state) => state.setIsLoading);
  const setError = useSafeStore((state) => state.setError);
  const reset = useSafeStore((state) => state.reset);

  useEffect(() => {
    if (!restaurantId) {
      reset();
      return;
    }

    setIsLoading(true);
    setError(null);

    // Écouter l'état du coffre
    const unsubscribeState = listenToSafeState(restaurantId, (state) => {
      setSafeState(state);
      setIsLoading(false);

      // Si pas d'état et autoCalculate activé, on calcule
      if (!state && autoCalculate) {
        calculateSafeState(restaurantId)
          .then(() => {
            setError(null);
          })
          .catch((error) => {
            console.error("Erreur calcul état coffre:", error);
            setError("Erreur lors du calcul de l'état du coffre");
          });
      }
    });

    // Écouter les mouvements
    const unsubscribeMovements = listenToSafeMovements(
      restaurantId,
      (movements) => {
        setMovements(movements);
      }
    );

    // Cleanup: stopper les listeners quand le composant est démonté
    return () => {
      unsubscribeState();
      unsubscribeMovements();
    };
  }, [
    restaurantId,
    autoCalculate,
    setSafeState,
    setMovements,
    setIsLoading,
    setError,
    reset,
  ]);
}
