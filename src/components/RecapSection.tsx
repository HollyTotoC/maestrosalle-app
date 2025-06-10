"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,

    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useEffect, useState } from "react";
import { useClosuresStore } from "@/store/useClosuresStore";
import { useAppStore } from "@/store/store";

import { listenToClosures, listenToUsers } from "@/lib/firebase/server";

import { useUsersStore } from "@/store/useUsersStore";

import RecapTable from "@/components/recap/RecapTable";
import RecapLineChart from "@/components/recap/RecapLineChart";
import RecapStackedBarChart from "@/components/recap/RecapStackedBarChart";
import RecapSafeEvolutionChart from "@/components/recap/RecapSafeEvolutionChart";
import { SectionSeparatorStack } from "./SectionSeparatorStack";

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
    const closures = useClosuresStore((state) => state.closures);
    const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);

    useEffect(() => {
        if (!selectedRestaurant?.id) return;

        const unsubscribe = listenToClosures(selectedRestaurant.id, (closures) => {
            useClosuresStore.getState().setClosures(closures); // Mettez à jour l'état avec les clôtures en temps réel
            setLoading(false);
        });

        return () => unsubscribe(); // Nettoyage lors du démontage
    }, [selectedRestaurant]);

    const users = useUsersStore((state) => state.users);

    useEffect(() => {
        const unsubscribe = listenToUsers();
        return () => unsubscribe();
    }, []);


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

    const allDates =
        rawDates.length > 0
            ? getDateRange(rawDates[0], rawDates[rawDates.length - 1])
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

    // Générer le chartData avec les jours manquants
    const chartData = allDates.map((dateStr) => {
        const data = closureMap.get(dateStr);
        return {
            date: dateStr,
            cashDiscrepancy: data?.cashDiscrepancy ?? 0,
            tpeDiscrepancy: data?.tpeDiscrepancy ?? 0,
            cashToKeep: data?.cashToKeep ?? 0,
            cashToSafe: data?.cashToSafe ?? 0,
            extraFlow: data?.extraFlow ?? 0,
        };
    });

    const safeData = chartData.reduce<
        { date: string; primeDeNoel: number; banque: number }[]
    >((acc, entry, index) => {
        const previous = acc[index - 1] || { primeDeNoel: 0, banque: 0 };
        acc.push({
            date: entry.date,
            primeDeNoel: previous.primeDeNoel + (entry.extraFlow ?? 0),
            banque:
                previous.banque +
                ((entry.cashToSafe ?? 0) - (entry.extraFlow ?? 0)),
        });
        return acc;
    }, []);

    // Correction du type pour yAxisDomain
    const safeMin = safeData.length > 0 ? Math.min(...safeData.map((d) => Math.min(d.primeDeNoel, d.banque))) : 0;
    const safeMax = safeData.length > 0 ? Math.max(...safeData.map((d) => Math.max(d.primeDeNoel, d.banque))) : 1;
    const yAxisDomain: [number, number] = [safeMin, safeMax];

    // Trier du plus récent au plus ancien
    const sortedChartData = [...chartData].sort((a, b) => b.date.localeCompare(a.date));

    // Pagination
    const ITEMS_PER_PAGE = 7;
    const [page, setPage] = useState(1);
    const pageCount = Math.ceil(sortedChartData.length / ITEMS_PER_PAGE);
    const paginatedData = sortedChartData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);


    if (loading) {
        return (
            <Card className="p-4 rounded-lg shadow">
                <CardHeader>
                    <CardTitle className="text-xl font-bold mb-4">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent >
                    <CardDescription>Chargement des données...</CardDescription>
                </CardContent>
            </Card>
        );
    }

    if (closures.length === 0) {
        return (
            <Card className="p-4 rounded-lg shadow">
                <CardHeader>
                    <CardTitle className="text-xl font-bold mb-4">Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>Aucune donnée disponible pour ce restaurant.</CardDescription>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="p-4 rounded border-2 shadow">
            <h2 className="text-xl font-bold">Récapitulatif</h2>
            <SectionSeparatorStack space={2} className="mb-2" />
            <Tabs defaultValue="table">
                <TabsList className="flex items-center justify-start flex-wrap h-auto space-y-1">
                    <TabsTrigger value="table">Tableau</TabsTrigger>
                    <TabsTrigger value="lineChart">
                        Évolution des écarts
                    </TabsTrigger>
                    <TabsTrigger value="stackedBarChart">
                        Répartition Cash
                    </TabsTrigger>
                    <TabsTrigger value="safeEvolution">
                        Évolution du Coffre
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
                    <RecapLineChart chartData={chartData} />
                </TabsContent>

                {/* Répartition Cash */}
                <TabsContent value="stackedBarChart">
                    <RecapStackedBarChart chartData={chartData} />
                </TabsContent>

                {/* Évolution du Coffre */}
                <TabsContent value="safeEvolution">
                    <RecapSafeEvolutionChart
                        safeData={safeData}
                        yAxisDomain={yAxisDomain}
                        chartConfig={chartConfig}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
