/**
 * Vue d'ensemble du coffre : affiche les soldes actuels
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVault, faSackDollar, faBuildingColumns, faCoins } from "@fortawesome/free-solid-svg-icons";
import { useSafeStore } from "@/store/useSafeStore";

export default function SafeOverview() {
  const safeState = useSafeStore((state) => state.safeState);
  const isLoading = useSafeStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faVault} className="text-primary" />
            État du Coffre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  const extraFlowBalance = safeState?.extraFlowBalance || 0;
  const banqueBalance = safeState?.banqueBalance || 0;
  const totalBalance = safeState?.totalBalance || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Extra-Flow */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/30 backdrop-blur-lg backdrop-saturate-150 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-amber-200/50 dark:border-2 dark:border-amber-700/50 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300 hover:scale-105 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-amber-900 dark:text-amber-400 dark:font-mono">
            <FontAwesomeIcon icon={faSackDollar} className="text-amber-600 dark:text-amber-400" />
            Extra-Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-amber-900 dark:text-amber-300 dark:font-mono">
            {extraFlowBalance.toFixed(2)} €
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-500 mt-1 dark:font-mono">
            Prime de Noël
          </p>
        </CardContent>
      </Card>

      {/* Banque */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/30 dark:to-teal-900/30 backdrop-blur-lg backdrop-saturate-150 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-emerald-200/50 dark:border-2 dark:border-emerald-700/50 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300 hover:scale-105 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-emerald-900 dark:text-emerald-400 dark:font-mono">
            <FontAwesomeIcon icon={faBuildingColumns} className="text-emerald-600 dark:text-emerald-400" />
            Banque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-300 dark:font-mono">
            {banqueBalance.toFixed(2)} €
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-500 mt-1 dark:font-mono">
            À déposer
          </p>
        </CardContent>
      </Card>

      {/* Total */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/30 backdrop-blur-lg backdrop-saturate-150 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-blue-200/50 dark:border-2 dark:border-blue-700/50 shadow-lg dark:shadow-sm transition-all duration-200 dark:duration-300 hover:scale-105 hover:shadow-xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-blue-900 dark:text-blue-400 dark:font-mono">
            <FontAwesomeIcon icon={faCoins} className="text-blue-600 dark:text-blue-400" />
            Total Coffre
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 dark:font-mono">
            {totalBalance.toFixed(2)} €
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-500 mt-1 dark:font-mono">
            Somme totale
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
