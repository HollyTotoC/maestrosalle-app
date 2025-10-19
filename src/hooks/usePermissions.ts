/**
 * Hook React pour faciliter la vérification des permissions
 * Utilise automatiquement le rôle et isAdmin depuis useUserStore
 */

import { useUserStore } from "@/store/useUserStore";
import {
  canAccessInvitations,
  canViewTeamPlanning,
  canCreateSpecialTasks,
  canViewDashboardCharts,
  canViewFullRecap,
  getMaxRecapDays,
  isManagerOrAdmin,
  canManageTeam,
  canAccessSafe,
  canModifySafe,
} from "@/lib/permissions";

export function usePermissions() {
  const role = useUserStore((state) => state.role);
  const isAdmin = useUserStore((state) => state.isAdmin);

  return {
    // Permissions individuelles
    canAccessInvitations: canAccessInvitations({ role, isAdmin }),
    canViewTeamPlanning: canViewTeamPlanning({ role, isAdmin }),
    canCreateSpecialTasks: canCreateSpecialTasks({ role, isAdmin }),
    canViewDashboardCharts: canViewDashboardCharts({ role, isAdmin }),
    canViewFullRecap: canViewFullRecap({ role, isAdmin }),
    canManageTeam: canManageTeam({ role, isAdmin }),
    canAccessSafe: canAccessSafe({ role, isAdmin }),
    canModifySafe: canModifySafe({ role, isAdmin }),

    // Helpers
    isManagerOrAdmin: isManagerOrAdmin({ role, isAdmin }),
    maxRecapDays: getMaxRecapDays({ role, isAdmin }),

    // Rôle actuel pour référence
    currentRole: role,
    isAdminUser: isAdmin,
  };
}
