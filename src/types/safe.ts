import { Timestamp } from "firebase/firestore";

/**
 * Type de mouvement dans le coffre
 * - deposit : Dépôt d'argent (ajout au coffre)
 * - withdrawal : Retrait d'argent (sortie du coffre)
 */
export type SafeMovementType = "deposit" | "withdrawal";

/**
 * Catégorie du mouvement
 * - extraFlow : Prime de Noël / Extra-flow (cagnotte spéciale)
 * - banque : Argent destiné à la banque
 */
export type SafeCategory = "extraFlow" | "banque";

/**
 * Mouvement manuel enregistré dans le coffre
 * Exemples :
 * - Retrait pour achat boucher (withdrawal, banque)
 * - Retrait pour prime de Noël (withdrawal, extraFlow)
 * - Dépôt manuel exceptionnel (deposit, banque)
 */
export interface SafeMovement {
  id: string;
  restaurantId: string;
  date: Timestamp; // Date du mouvement
  type: SafeMovementType;
  category: SafeCategory;
  amount: number; // Montant (toujours positif)
  description: string; // Description du mouvement
  createdBy: string; // userId de la personne qui a créé le mouvement
  createdByName: string; // displayName pour affichage
  createdAt: Timestamp; // Date de création de l'enregistrement
}

/**
 * État actuel calculé du coffre pour un restaurant
 * Optimisé pour éviter de recalculer depuis le début à chaque fois
 */
export interface SafeState {
  restaurantId: string;
  extraFlowBalance: number; // Solde actuel de l'extra-flow (prime de Noël)
  banqueBalance: number; // Solde actuel de l'argent destiné à la banque
  totalBalance: number; // Solde total du coffre
  lastRecalculatedAt: Timestamp; // Dernière fois que le calcul a été fait
  lastClosureDate?: Timestamp; // Dernière clôture intégrée dans le calcul
  lastMovementDate?: Timestamp; // Dernier mouvement manuel intégré
}

/**
 * Formulaire d'ajout de mouvement (côté client)
 */
export interface SafeMovementFormData {
  type: SafeMovementType;
  category: SafeCategory;
  amount: number;
  description: string;
  date?: Date; // Date optionnelle, par défaut aujourd'hui
}

/**
 * Résultat du calcul de l'état du coffre
 * Utilisé pour afficher les détails du calcul
 */
export interface SafeCalculationResult {
  extraFlowBalance: number;
  banqueBalance: number;
  totalBalance: number;
  closuresCount: number; // Nombre de clôtures intégrées
  movementsCount: number; // Nombre de mouvements manuels intégrés
  lastUpdate: Timestamp;
}
