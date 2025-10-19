/**
 * Liste/historique des mouvements du coffre
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faArrowUp, faArrowDown, faSackDollar, faBuildingColumns } from "@fortawesome/free-solid-svg-icons";
import { useSafeStore } from "@/store/useSafeStore";
import type { SafeMovement } from "@/types/safe";

export default function SafeMovementsList() {
  const movements = useSafeStore((state) => state.movements);
  const isLoading = useSafeStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-primary" />
            Historique des mouvements
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="h-[350px] md:max-h-[600px] md:h-auto flex items-center justify-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (movements.length === 0) {
    return (
      <Card className="bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faHistory} className="text-primary" />
            Historique des mouvements
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="h-[350px] md:max-h-[600px] md:h-auto md:min-h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground italic text-sm">
              Aucun mouvement enregistré pour ce restaurant
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (timestamp: { seconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMovementIcon = (movement: SafeMovement) => {
    return movement.type === "withdrawal" ? faArrowUp : faArrowDown;
  };

  const getMovementColor = (movement: SafeMovement) => {
    return movement.type === "withdrawal"
      ? "text-red-500 dark:text-red-400"
      : "text-green-500 dark:text-green-400";
  };

  const getCategoryIcon = (category: "extraFlow" | "banque") => {
    return category === "extraFlow" ? faSackDollar : faBuildingColumns;
  };

  const getCategoryColor = (category: "extraFlow" | "banque") => {
    return category === "extraFlow"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  };

  return (
    <Card className="bg-card/80 backdrop-blur-lg backdrop-saturate-150 dark:bg-card/90 dark:backdrop-blur-none rounded-xl dark:rounded-lg border border-border/50 dark:border-2 shadow-lg dark:shadow-sm flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <FontAwesomeIcon icon={faHistory} className="text-primary" />
          Historique des mouvements
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {/* Conteneur avec scroll et hauteur responsive */}
        <div className="h-[350px] md:max-h-[600px] md:h-auto overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="flex items-center justify-between p-3 rounded-lg dark:rounded bg-background/50 dark:bg-background/30 border border-border/30 dark:border-border/50 transition-all duration-200 hover:bg-background/70 dark:hover:bg-background/50"
            >
              {/* Gauche : Type + Catégorie + Description */}
              <div className="flex items-center gap-3 flex-1">
                {/* Icône type (retrait/dépôt) */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg dark:rounded-sm ${getMovementColor(movement)}`}>
                  <FontAwesomeIcon
                    icon={getMovementIcon(movement)}
                    className="text-lg"
                  />
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground dark:font-mono">
                      {movement.description}
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getCategoryColor(movement.category)}`}
                    >
                      <FontAwesomeIcon
                        icon={getCategoryIcon(movement.category)}
                        className="mr-1 text-xs"
                      />
                      {movement.category === "extraFlow" ? "Extra-Flow" : "Banque"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground dark:font-mono">
                    {formatDate(movement.date)} • par {movement.createdByName}
                  </p>
                </div>
              </div>

              {/* Droite : Montant */}
              <div className="text-right">
                <p
                  className={`text-lg font-bold dark:font-mono ${getMovementColor(movement)}`}
                >
                  {movement.type === "withdrawal" ? "−" : "+"}{" "}
                  {movement.amount.toFixed(2)} €
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
