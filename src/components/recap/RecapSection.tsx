"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useEffect, useState } from "react";
import { useClosuresStore } from "@/store/useClosuresStore";
import { useAppStore } from "@/store/store";
import { usePermissions } from "@/hooks/usePermissions";

import { listenToClosures } from "@/lib/firebase/server";
import { listenToSafeMovements } from "@/lib/firebase/safeOperations";

import { useUsersStore } from "@/store/useUsersStore";
import type { SafeMovement } from "@/types/safe";

import RecapTable from "@/components/recap/RecapTable";
import RecapLineChart from "@/components/recap/RecapLineChart";
import RecapStackedBarChart from "@/components/recap/RecapStackedBarChart";
import RecapSafeEvolutionChart from "@/components/recap/RecapSafeEvolutionChart";
import { SectionSeparatorStack } from "../SectionSeparatorStack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faFilter, faX } from "@fortawesome/free-solid-svg-icons";

const chartConfig = {
    primeDeNoel: {
        label: "Prime de Noël",
        color: "hsla(360, 74%, 66%, 1)",
    },
    banque: {
        label: "Banque",
        color: "hsla(176, 88%, 22%, 1)",
    },
};

export default function RecapSection() {
    const [loading, setLoading] = useState(true);
    const [safeMovements, setSafeMovements] = useState<SafeMovement[]>([]);
    const [dateFilterStart, setDateFilterStart] = useState<string>("");
    const [dateFilterEnd, setDateFilterEnd] = useState<string>(
        new Date().toISOString().split("T")[0] // Date du jour par défaut
    );
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const closures = useClosuresStore((state) => state.closures);
    const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);
    const { canViewDashboardCharts, maxRecapDays } = usePermissions();

    useEffect(() => {
        if (!selectedRestaurant?.id) return;

        const unsubscribe = listenToClosures(selectedRestaurant.id, (closures) => {
            useClosuresStore.getState().setClosures(closures); // Mettez à jour l'état avec les clôtures en temps réel
            setLoading(false);
        });

        return () => unsubscribe(); // Nettoyage lors du démontage
    }, [selectedRestaurant]);

    // Écouter les mouvements du coffre
    useEffect(() => {
        if (!selectedRestaurant?.id) return;

        const unsubscribe = listenToSafeMovements(selectedRestaurant.id, (movements) => {
            setSafeMovements(movements);
        });

        return () => unsubscribe();
    }, [selectedRestaurant]);

    const users = useUsersStore((state) => state.users);

    // Fonction pour générer une plage de dates
    function getDateRange(start: Date, end: Date): string[] {
        const range: string[] = [];
        const current = new Date(start.getTime());
        while (current <= end) {
            range.push(current.toISOString().split("T")[0]);
            current.setDate(current.getDate() + 1);
        }
        return range;
    }

    // Récupérer toutes les dates des clôtures
    const rawDates = closures
        .map((entry) => new Date(entry.date.seconds * 1000))
        .sort((a, b) => a.getTime() - b.getTime());

    // Calculer les dates min/max pour le filtre
    const minDateForFilter = rawDates.length > 0 ? rawDates[0].toISOString().split("T")[0] : "";
    const maxDateForFilter = new Date().toISOString().split("T")[0]; // Aujourd'hui

    // Filtrer selon les permissions (Extra : 7 derniers jours uniquement)
    const today = new Date();
    const limitDate = new Date(today);
    limitDate.setDate(today.getDate() - maxRecapDays);

    const filteredRawDates = rawDates.filter((date) => date >= limitDate);

    const allDates =
        filteredRawDates.length > 0
            ? getDateRange(filteredRawDates[0], filteredRawDates[filteredRawDates.length - 1])
            : [];

    // Créer une map des données des clôtures
    const closureMap = new Map(
        closures.map((entry) => [
            new Date(entry.date.seconds * 1000).toISOString().split("T")[0],
            {
                cashDiscrepancy: entry.cashDiscrepancy,
                tpeDiscrepancy: entry.tpeDiscrepancy,
                cashToKeep: entry.cashToKeep,
                cashToSafe: entry.cashToSafe,
                extraFlow: entry.extraFlowEntries?.reduce(
                    (sum, e) => sum + e.amount,
                    0
                ),
            },
        ])
    );

    // Générer le chartData avec les jours manquants (utiliser null pour les données absentes)
    const chartData = allDates.map((dateStr) => {
        const data = closureMap.get(dateStr);
        return {
            date: dateStr,
            cashDiscrepancy: data?.cashDiscrepancy ?? null,
            tpeDiscrepancy: data?.tpeDiscrepancy ?? null,
            cashToKeep: data?.cashToKeep ?? null,
            cashToSafe: data?.cashToSafe ?? null,
            extraFlow: data?.extraFlow ?? null,
        };
    });

    // Calculer l'évolution du coffre en incluant TOUTES les dates (clôtures + mouvements)
    // IMPORTANT : Utiliser TOUTES les clôtures (pas filtré par permissions) pour le calcul correct
    const allClosuresForSafe = useClosuresStore.getState().closures; // Toutes les clôtures sans filtre

    // 1. Récupérer toutes les dates uniques (clôtures + mouvements)
    const allSafeDates = new Set<string>();

    // Dates des clôtures (TOUTES, pas seulement celles filtrées)
    allClosuresForSafe.forEach((closure) => {
        if (closure.restaurantId === selectedRestaurant?.id) {
            const dateStr = new Date(closure.date.seconds * 1000).toISOString().split("T")[0];
            allSafeDates.add(dateStr);
        }
    });

    // Dates des mouvements
    safeMovements.forEach((movement) => {
        const dateStr = new Date(movement.date.seconds * 1000).toISOString().split("T")[0];
        allSafeDates.add(dateStr);
    });

    // Trier les dates
    const sortedSafeDates = Array.from(allSafeDates).sort();

    // 2. Calculer l'évolution cumulative jour par jour
    const safeData = sortedSafeDates.reduce<
        { date: string; primeDeNoel: number; banque: number }[]
    >((acc, dateStr, index) => {
        const previous = acc[index - 1] || { primeDeNoel: 0, banque: 0 };

        // Entrées depuis les clôtures ce jour-là (utiliser TOUTES les clôtures)
        const closureOfTheDay = allClosuresForSafe.find((c) => {
            const closureDate = new Date(c.date.seconds * 1000).toISOString().split("T")[0];
            return closureDate === dateStr && c.restaurantId === selectedRestaurant?.id;
        });

        let extraFlowFromClosure = 0;
        let banqueFromClosure = 0;

        if (closureOfTheDay) {
            // ExtraFlow va entièrement dans "Prime de Noël"
            extraFlowFromClosure = closureOfTheDay.extraFlowEntries?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
            // CashToSafe va entièrement dans "Banque"
            banqueFromClosure = closureOfTheDay.cashToSafe ?? 0;
        }

        // Mouvements manuels ce jour-là
        const movementsOfTheDay = safeMovements.filter((movement) => {
            const movementDate = new Date(movement.date.seconds * 1000).toISOString().split("T")[0];
            return movementDate === dateStr;
        });

        let extraFlowFromMovements = 0;
        let banqueFromMovements = 0;

        movementsOfTheDay.forEach((movement) => {
            const amount = movement.amount;
            const multiplier = movement.type === "deposit" ? 1 : -1;

            if (movement.category === "extraFlow") {
                extraFlowFromMovements += amount * multiplier;
            } else {
                banqueFromMovements += amount * multiplier;
            }
        });

        acc.push({
            date: dateStr,
            primeDeNoel: previous.primeDeNoel + extraFlowFromClosure + extraFlowFromMovements,
            banque: previous.banque + banqueFromClosure + banqueFromMovements,
        });
        return acc;
    }, []);

    // Appliquer le filtre de période si défini (uniquement si dateFilterStart est défini)
    const filteredChartData = chartData.filter((entry) => {
        if (!dateFilterStart) return true; // Pas de filtre si date de début non définie
        const entryDate = entry.date;
        if (dateFilterStart && entryDate < dateFilterStart) return false;
        if (dateFilterEnd && entryDate > dateFilterEnd) return false;
        return true;
    });

    const filteredSafeData = safeData.filter((entry) => {
        if (!dateFilterStart) return true; // Pas de filtre si date de début non définie
        const entryDate = entry.date;
        if (dateFilterStart && entryDate < dateFilterStart) return false;
        if (dateFilterEnd && entryDate > dateFilterEnd) return false;
        return true;
    });

    // Correction du type pour yAxisDomain (sur données filtrées)
    const safeMin = filteredSafeData.length > 0 ? Math.min(...filteredSafeData.map((d) => Math.min(d.primeDeNoel, d.banque))) : 0;
    const safeMax = filteredSafeData.length > 0 ? Math.max(...filteredSafeData.map((d) => Math.max(d.primeDeNoel, d.banque))) : 1;
    const yAxisDomain: [number, number] = [safeMin, safeMax];

    // Trier du plus récent au plus ancien (sur données filtrées)
    const sortedChartData = [...filteredChartData].sort((a, b) => b.date.localeCompare(a.date));

    // Compacter les périodes sans données AVANT la pagination
    const compactData = (data: typeof sortedChartData) => {
        const result: (typeof data[0] | { type: 'gap'; startDate: string; endDate: string })[] = [];
        let gapStart: string | null = null;
        let gapEnd: string | null = null;

        data.forEach((entry) => {
            const isMissingData =
                entry.cashToSafe == null &&
                entry.cashToKeep == null &&
                entry.cashDiscrepancy == null &&
                entry.tpeDiscrepancy == null &&
                (entry.extraFlow == null || entry.extraFlow === 0);

            if (isMissingData) {
                if (gapStart === null) {
                    gapStart = entry.date;
                }
                gapEnd = entry.date;
            } else {
                if (gapStart !== null && gapEnd !== null) {
                    if (gapStart === gapEnd) {
                        result.push(data.find(e => e.date === gapStart)!);
                    } else {
                        result.push({ type: 'gap', startDate: gapStart, endDate: gapEnd });
                    }
                    gapStart = null;
                    gapEnd = null;
                }
                result.push(entry);
            }
        });

        if (gapStart !== null && gapEnd !== null) {
            if (gapStart === gapEnd) {
                result.push(data.find(e => e.date === gapStart)!);
            } else {
                result.push({ type: 'gap', startDate: gapStart, endDate: gapEnd });
            }
        }

        return result;
    };

    const compactedData = compactData(sortedChartData);

    // Pagination sur les données compactées
    const ITEMS_PER_PAGE = 7;
    const [page, setPage] = useState(1);
    const pageCount = Math.ceil(compactedData.length / ITEMS_PER_PAGE);
    const paginatedData = compactedData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    // Fonction pour réinitialiser le filtre
    const clearFilter = () => {
        setDateFilterStart("");
        setDateFilterEnd(new Date().toISOString().split("T")[0]); // Remettre à aujourd'hui
    };

    // Fonction pour appliquer le filtre
    const applyFilter = () => {
        setIsFilterDialogOpen(false);
        setPage(1); // Retour à la première page
    };


    if (loading) {
        return (
            <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 p-4 md:p-6 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartLine} className="text-primary" />
                    Récapitulatif
                </h2>
                <SectionSeparatorStack space={2} className="mb-2 hidden dark:block" />
                <p className="text-muted-foreground">Chargement des données...</p>
            </div>
        );
    }

    if (closures.length === 0) {
        return (
            <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 p-4 md:p-6 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartLine} className="text-primary" />
                    Récapitulatif
                </h2>
                <SectionSeparatorStack space={2} className="mb-2 hidden dark:block" />
                <p className="text-muted-foreground">Aucune donnée disponible pour ce restaurant.</p>
            </div>
        );
    }

    return (
        <div className="bg-card/60 backdrop-blur-xl backdrop-saturate-150 p-4 md:p-6 rounded-2xl dark:rounded border border-border/40 dark:border-2 shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2">
                    <FontAwesomeIcon icon={faChartLine} className="text-primary" />
                    Récapitulatif
                </h2>
                <div className="flex items-center gap-2">
                    {dateFilterStart && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilter}
                            className="text-xs"
                        >
                            <FontAwesomeIcon icon={faX} className="mr-1" />
                            Réinitialiser
                        </Button>
                    )}
                    <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                                Filtrer la période
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Filtrer par période</DialogTitle>
                                <DialogDescription>
                                    Sélectionnez une plage de dates pour zoomer sur une période spécifique.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date-start">Date de début</Label>
                                    <Input
                                        id="date-start"
                                        type="date"
                                        value={dateFilterStart}
                                        min={minDateForFilter}
                                        max={dateFilterEnd || maxDateForFilter}
                                        onChange={(e) => setDateFilterStart(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {minDateForFilter && `Première entrée : ${minDateForFilter}`}
                                    </p>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="date-end">Date de fin (par défaut : aujourd&apos;hui)</Label>
                                    <Input
                                        id="date-end"
                                        type="date"
                                        value={dateFilterEnd}
                                        min={dateFilterStart || minDateForFilter}
                                        max={maxDateForFilter}
                                        onChange={(e) => setDateFilterEnd(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Maximum : {maxDateForFilter} (aujourd&apos;hui)
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={applyFilter}>
                                    Appliquer
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <SectionSeparatorStack space={2} className="mb-2 hidden dark:block" />
            {canViewDashboardCharts ? (
                /* Utilisateurs avec accès complet : tous les onglets */
                <Tabs defaultValue="table">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">Tableau</TabsTrigger>
                        <TabsTrigger value="lineChart" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                            Écarts
                        </TabsTrigger>
                        <TabsTrigger value="stackedBarChart" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                            Cash
                        </TabsTrigger>
                        <TabsTrigger value="safeEvolution" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                            Coffre
                        </TabsTrigger>
                    </TabsList>

                    {/* Vue Tableau */}
                    <TabsContent value="table">
                        <RecapTable
                            paginatedData={paginatedData}
                            closures={closures}
                            users={users}
                            page={page}
                            pageCount={pageCount}
                            setPage={setPage}
                        />
                    </TabsContent>

                    {/* Graphique des écarts */}
                    <TabsContent value="lineChart">
                        <RecapLineChart chartData={filteredChartData} />
                    </TabsContent>

                    {/* Répartition Cash */}
                    <TabsContent value="stackedBarChart">
                        <RecapStackedBarChart chartData={filteredChartData} />
                    </TabsContent>

                    {/* Évolution du Coffre */}
                    <TabsContent value="safeEvolution">
                        <RecapSafeEvolutionChart
                            safeData={filteredSafeData}
                            yAxisDomain={yAxisDomain}
                            chartConfig={chartConfig}
                        />
                    </TabsContent>
                </Tabs>
            ) : (
                /* Extra : seulement le tableau (7 derniers jours) */
                <RecapTable
                    paginatedData={paginatedData}
                    closures={closures}
                    users={users}
                    page={page}
                    pageCount={pageCount}
                    setPage={setPage}
                />
            )}
        </div>
    );
}
