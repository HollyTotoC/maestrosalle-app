"use client";

import { useEffect, useState } from "react";
import { listenToBatchesFiltered } from "@/lib/firebase/server";
import { Bac, TiramisuBatch } from "@/types/tiramisu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function TiramisuList() {
  const [batches, setBatches] = useState<TiramisuBatch[]>([]);

  useEffect(() => {
    const unsubscribe = listenToBatchesFiltered((fetchedBatches) => {
      console.log("📦 Batches received in component:", fetchedBatches);
      setBatches(fetchedBatches);
    });

    return () => unsubscribe(); // Arrêter l'écoute en cas de démontage
  }, []);

  // Calculer tous les bacs restants (y compris les partiels)
  const remainingBacs = batches.flatMap<Bac>((batch) => {
    const totalRemaining = batch.totalBacs - batch.consumedBacs - batch.partialConsumption;
    const fullBacs = Math.floor(totalRemaining);
    const hasPartialBac = totalRemaining % 1 > 0;
    const partialBacWidth = hasPartialBac ? totalRemaining % 1 : 0;

    const bacs: Bac[] = Array.from({ length: fullBacs }).map(() => ({
      type: "full",
      batch,
    }));

    if (hasPartialBac) {
      bacs.push({ type: "partial", batch, width: partialBacWidth });
    }

    return bacs;
  });

  // Trier les bacs pour que les partiels soient toujours en haut
  const sortedBacs = [...remainingBacs].reverse();

  // Calculer le résumé global
  const totalBacs = batches.reduce((sum, batch) => sum + batch.totalBacs, 0);
  const totalConsumed = batches.reduce(
    (sum, batch) => sum + batch.consumedBacs,
    0
  );
  const totalRemaining = totalBacs - totalConsumed;

  // Calculer le nombre d'étagères vides nécessaires
  const emptyShelvesCount = Math.max(0, 10 - sortedBacs.length);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 md:gap-10 md:flex-row">
        {/* Résumé global */}
        <Card className="hidden md:flex w-full">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Résumé du frigo</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Total de bacs : {totalBacs}</p>
            <p>Bacs consommés : {totalConsumed}</p>
            <p>Bacs restants : {totalRemaining}</p>
          </CardContent>
        </Card>

        {/* Section Frigo */}
        <div
          id="fridge"
          className="bg-gray-500 p-4 rounded-lg w-full"
        >
          <div className="grid grid-cols-1 bg-gray-800 border-4 border-white rounded-sm gap-2">
            {/* Étagères vides */}
            {Array.from({ length: emptyShelvesCount }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="batch flex items-center gap-2 h-8 bg-gray-800 border border-gray-600 rounded-sm"
              >
                <p className="text-gray-400 text-sm mx-auto">Étagère vide</p>
              </div>
            ))}

            {/* Bacs pleins ou partiels */}
            {sortedBacs.map((bac, i) => (
              <Tooltip key={`bac-${i}`}>
                <TooltipTrigger>
                  <div
                    className={`batch p-1 mx-4 mt-2 ${
                      bac.type === "full"
                        ? "bg-sky-500/20"
                        : "bg-red-500/20"
                    } border border-sky-500/50 rounded-sm`}
                  >
                    {bac.type === "full" ? (
                      <>
                        <div className="h-0.5 w-full"></div> {/* Couvercle */}
                        <div className="h-4 bg-yellow-50 w-full"></div> {/* Crème */}
                        <div className="h-1.5 bg-yellow-700 w-full"></div> {/* Biscuit */}
                      </>
                    ) : (
                      <>
                        <div className="h-0.5 w-full"></div> {/* Couvercle */}
                        <div
                          className="h-4 bg-yellow-50"
                          style={{
                            width: `${bac.width * 100}%`,
                          }}
                        ></div>{" "}
                        {/* Crème */}
                        <div
                          className="h-1.5 bg-yellow-700"
                          style={{
                            width: `${bac.width * 100}%`,
                          }}
                        ></div>{" "}
                        {/* Biscuit */}
                      </>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    <strong>Batch #{bac.batch.id}</strong>
                  </p>
                  <p>Préparé par : {bac.batch.createdBy}</p>
                  <p>Bacs totaux : {bac.batch.totalBacs}</p>
                  <p>Bacs consommés : {bac.batch.consumedBacs}</p>
                  <p>
                    Consommation partielle :{" "}
                    {bac.batch.partialConsumption * 100}%
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
