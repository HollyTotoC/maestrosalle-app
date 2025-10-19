/**
 * Système centralisé de gestion des permissions par rôle
 *
 * Hiérarchie des rôles (du plus au moins de permissions) :
 * - admin : Accès complet à toutes les fonctionnalités
 * - manager : Accès à la plupart des fonctionnalités (sauf certaines admin-only)
 * - cuisine : Accès aux fonctionnalités métier (clôture, stocks, tiramisu)
 * - CDI : Accès limité, pas d'outils de gestion d'équipe
 * - extra : Accès très restreint, vue limitée
 */

export type Role = "admin" | "CDI" | "manager" | "cuisine" | "extra" | null;

export interface PermissionCheck {
  role: Role;
  isAdmin?: boolean;
}

/**
 * Vérifie si l'utilisateur peut accéder à l'outil d'invitation
 * Autorisé pour : admin, manager
 */
export function canAccessInvitations({ role, isAdmin }: PermissionCheck): boolean {
  if (isAdmin) return true;
  return role === "admin" || role === "manager";
}

/**
 * Vérifie si l'utilisateur peut voir le planning/calendrier des disponibilités de l'équipe
 * Autorisé pour : admin, manager
 */
export function canViewTeamPlanning({ role, isAdmin }: PermissionCheck): boolean {
  if (isAdmin) return true;
  return role === "admin" || role === "manager";
}

/**
 * Vérifie si l'utilisateur peut créer des special tasks
 * Interdit pour : extra
 */
export function canCreateSpecialTasks({ role, isAdmin }: PermissionCheck): boolean {
  if (isAdmin) return true;
  return role !== "extra";
}

/**
 * Vérifie si l'utilisateur peut voir les graphiques du dashboard
 * Interdit pour : extra
 */
export function canViewDashboardCharts({ role, isAdmin }: PermissionCheck): boolean {
  if (isAdmin) return true;
  return role !== "extra";
}

/**
 * Vérifie si l'utilisateur peut voir le récapitulatif complet (tous les jours)
 * Extra : seulement les 7 derniers jours
 */
export function canViewFullRecap({ role, isAdmin }: PermissionCheck): boolean {
  if (isAdmin) return true;
  return role !== "extra";
}

/**
 * Retourne le nombre de jours maximum pour le récapitulatif selon le rôle
 * Extra : 7 jours, autres : illimité (999 jours par défaut)
 */
export function getMaxRecapDays({ role, isAdmin }: PermissionCheck): number {
  if (isAdmin) return 999;
  return role === "extra" ? 7 : 999;
}

/**
 * Vérifie si l'utilisateur a un rôle de gestion (manager ou admin)
 */
export function isManagerOrAdmin({ role, isAdmin }: PermissionCheck): boolean {
  if (isAdmin) return true;
  return role === "admin" || role === "manager";
}

/**
 * Vérifie si l'utilisateur peut gérer l'équipe (voir staff, modifier rôles, etc.)
 * Autorisé pour : admin, manager
 */
export function canManageTeam({ role, isAdmin }: PermissionCheck): boolean {
  if (isAdmin) return true;
  return role === "admin" || role === "manager";
}

/**
 * Vérifie si l'utilisateur peut accéder à la gestion du coffre
 * Autorisé pour : admin, manager, CDI, cuisine
 * Interdit pour : extra
 */
export function canAccessSafe({ role, isAdmin }: PermissionCheck): boolean {
  if (isAdmin) return true;
  return role !== "extra" && role !== null;
}

/**
 * Vérifie si l'utilisateur peut modifier les mouvements du coffre
 * Autorisé pour : admin, manager, CDI, cuisine
 * Interdit pour : extra
 */
export function canModifySafe({ role, isAdmin }: PermissionCheck): boolean {
  if (isAdmin) return true;
  return role !== "extra" && role !== null;
}
