/**
 * Calcul des pourboires pour le personnel et la cuisine.
 * @param totalTips - Montant total des pourboires.
 * @param staffCount - Nombre de serveurs en salle.
 * @returns kitchenShare, tipPerStaff
 */
export function calculateTips(totalTips: number, staffCount: number) {
  let kitchenShare = 0;
  let tipPerStaff = 0;

  if (staffCount > 2) {
    kitchenShare = totalTips * 0.3;
    tipPerStaff = (totalTips * 0.7) / staffCount;
  } else {
    kitchenShare = totalTips / (staffCount + 1);
    tipPerStaff = kitchenShare; // Part égale pour la cuisine et les serveurs
  }

  return {
    kitchenShare: parseFloat(kitchenShare.toFixed(2)),
    tipPerStaff: parseFloat(tipPerStaff.toFixed(2)),
  };
}

/**
 * Calcul des écarts entre les montants TPE et Zelty.
 * @param cbZelty - Montant total des paiements par carte selon Zelty.
 * @param tpeAmounts - Montants réels par TPE.
 * @returns tpeDiscrepancy
 */
export function calculateTpeDiscrepancy(cbZelty: number, tpeAmounts: number[]) {
  const totalTpe = tpeAmounts.reduce((sum, amount) => sum + amount, 0);
  const tpeDiscrepancy = cbZelty - totalTpe;

  return {
    tpeDiscrepancy: parseFloat(tpeDiscrepancy.toFixed(2)),
  };
}

/**
 * Calcul des écarts de caisse.
 * @param countedCash - Montant de cash compté physiquement.
 * @param cashOutZelty - Montant total des cash sortie de la caisse.
 * @param extraFlow - Flux additionnels (remboursements, ajouts manuels).
 * @param cashZelty - Montant déclaré en cash dans Zelty.
 * @param previousCash - Montant laissé en caisse la veille.
 * @returns cashDiscrepancy
 */
export function calculateCashDiscrepancy(
  countedCash: number,
  cashOutZelty: number,
  extraFlow: number,
  cashZelty: number,
  previousCash: number
) {
  const expectedCash = previousCash + cashZelty + extraFlow - cashOutZelty;
  const cashDiscrepancy = countedCash - expectedCash;

  return {
    cashDiscrepancy: parseFloat(cashDiscrepancy.toFixed(2)),
    expectedCash: parseFloat(expectedCash.toFixed(2)),
  };
}

/**
 * Détermine les statuts des écarts (CB et espèces).
 * @param tpeDiscrepancy - Écart CB calculé.
 * @param cashDiscrepancy - Écart espèces calculé.
 * @param cbThreshold - Tolérance pour l'écart CB.
 * @param cashThreshold - Tolérance pour l'écart espèces.
 * @returns cbStatus, cashStatus
 */
export function determineStatuses(
  tpeDiscrepancy: number,
  cashDiscrepancy: number,
  cbThreshold: number = 5,
  cashThreshold: number = 20
) {
  const cbStatus = Math.abs(tpeDiscrepancy) <= cbThreshold ? "OK" : "alert";
  const cashStatus =
    Math.abs(cashDiscrepancy) <= cashThreshold
      ? "OK"
      : Math.abs(cashDiscrepancy) <= cashThreshold * 2
      ? "warning"
      : "alert";

  return { cbStatus, cashStatus };
}