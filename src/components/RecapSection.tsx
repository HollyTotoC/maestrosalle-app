"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    BarChart,
    Bar,
    AreaChart,
    Area,
} from "recharts";
import { useEffect, useState } from "react";
import { useClosuresStore } from "@/store/useClosuresStore";
import { useAppStore } from "@/store/store";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { listenToClosures, listenToUsers } from "@/lib/firebase/server";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useUsersStore } from "@/store/useUsersStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
            cashDiscrepancy: data?.cashDiscrepancy ?? null,
            tpeDiscrepancy: data?.tpeDiscrepancy ?? null,
            cashToKeep: data?.cashToKeep ?? null,
            cashToSafe: data?.cashToSafe ?? null,
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

    const yAxisDomain = [
        Math.min(...safeData.map((d) => Math.min(d.primeDeNoel, d.banque))),
        Math.max(...safeData.map((d) => Math.max(d.primeDeNoel, d.banque))),
    ];

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
        <div className="p-4 border-2 shadow">
            <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>

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
                    <Card>
                        <CardHeader>
                            <CardTitle>Historique de cloture de caisse</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="">Date</TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Coffre (€)
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Caisse (€)
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        ExtraFlow (€)
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Écart CB (€)
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">
                                        Écart Cash (€)
                                    </TableHead>
                                    <TableHead className="hidden md:table-cell">Validé par</TableHead>
                                    <TableHead className="md:hidden"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((entry) => {
                                    const isMissingData =
                                        entry.cashToSafe == null &&
                                        entry.cashToKeep == null &&
                                        entry.cashDiscrepancy == null &&
                                        entry.tpeDiscrepancy == null &&
                                        (entry.extraFlow == null ||
                                            entry.extraFlow === 0);

                                    console.log("entry.date:", entry.date);
                                    console.log(
                                        "entry.cashToSafe:",
                                        entry.cashToSafe
                                    );
                                    console.log(
                                        "entry.cashToKeep:",
                                        entry.cashToKeep
                                    );
                                    console.log(
                                        "entry.extraFlow:",
                                        entry.extraFlow
                                    );
                                    console.log(
                                        "entry.cashDiscrepancy:",
                                        entry.cashDiscrepancy
                                    );
                                    console.log(
                                        "entry.tpeDiscrepancy:",
                                        entry.tpeDiscrepancy
                                    );
                                    console.log("isMissingData:", isMissingData);

                                    return (
                                        <TableRow
                                            key={entry.date}
                                            className={`${
                                                isMissingData
                                                    ? "text-gray-500 bg-background/40"
                                                    : "bg-background hover:bg-accent hover:text-accent-foreground"
                                            } md:table-row`}
                                        >
                                            <TableCell className="">
                                                {entry.date}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {entry.cashToSafe !== null
                                                    ? `${entry.cashToSafe} €`
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {entry.cashToKeep !== null
                                                    ? `${entry.cashToKeep} €`
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {entry.extraFlow !== null
                                                    ? `${entry.extraFlow} €`
                                                    : "N/A"}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge
                                                    variant={
                                                        entry.tpeDiscrepancy ===
                                                        null
                                                            ? "default"
                                                            : entry.tpeDiscrepancy <
                                                            5
                                                            ? "secondary"
                                                            : "destructive"
                                                    }
                                                >
                                                    {entry.tpeDiscrepancy !== null
                                                        ? `${entry.tpeDiscrepancy} €`
                                                        : "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge
                                                    variant={
                                                        entry.cashDiscrepancy ===
                                                        null
                                                            ? "default"
                                                            : entry.cashDiscrepancy <
                                                            5
                                                            ? "secondary"
                                                            : "destructive"
                                                    }
                                                >
                                                    {entry.cashDiscrepancy !== null
                                                        ? `${entry.cashDiscrepancy} €`
                                                        : "N/A"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {(() => {
                                                    // On retrouve la closure d'origine pour la date
                                                    const closure = closures.find(
                                                        (c) =>
                                                            new Date(c.date.seconds * 1000).toISOString().split("T")[0] === entry.date
                                                    );
                                                    const user = closure ? users[closure.validatedBy] : undefined;
                                                    if (!user) return <span className="text-gray-400">-</span>;
                                                    return (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName} />}
                                                                <AvatarFallback>
                                                                    {user.displayName
                                                                        .split(" ")
                                                                        .map((n) => n[0])
                                                                        .join("")
                                                                        .toUpperCase()
                                                                        .slice(0, 2)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>{user.displayName}</span>
                                                        </div>
                                                    );
                                                })()}
                                            </TableCell>
                                            {/* Mobile: Bouton pour ouvrir le dialogue */}
                                            <TableCell className="md:hidden">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button>Détails</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Détails pour{" "}
                                                                {entry.date}
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-2">
                                                            <p>
                                                                <strong>
                                                                    Date :
                                                                </strong>{" "}
                                                                {entry.date}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Coffre :
                                                                </strong>{" "}
                                                                {entry.cashToSafe !==
                                                                null
                                                                    ? `${entry.cashToSafe} €`
                                                                    : "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Caisse :
                                                                </strong>{" "}
                                                                {entry.cashToKeep !==
                                                                null
                                                                    ? `${entry.cashToKeep} €`
                                                                    : "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    ExtraFlow :
                                                                </strong>{" "}
                                                                {entry.extraFlow !==
                                                                null
                                                                    ? `${entry.extraFlow} €`
                                                                    : "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Écart CB :
                                                                </strong>{" "}
                                                                {entry.tpeDiscrepancy !==
                                                                null
                                                                    ? `${entry.tpeDiscrepancy} €`
                                                                    : "N/A"}
                                                            </p>
                                                            <p>
                                                                <strong>
                                                                    Écart Cash :
                                                                </strong>{" "}
                                                                {entry.cashDiscrepancy !==
                                                                null
                                                                    ? `${entry.cashDiscrepancy} €`
                                                                    : "N/A"}
                                                            </p>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {/* Pagination */}
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        className={`cursor-pointer${page === 1 ? " pointer-events-none opacity-50" : ""}`}
                                        onClick={() => {
                                            if (page > 1) setPage((p) => Math.max(1, p - 1));
                                        }}
                                    />
                                </PaginationItem>
                                <PaginationItem>
                                    {page} / {pageCount}
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationNext
                                        className={`cursor-pointer${page === pageCount ? " pointer-events-none opacity-50" : ""}`}
                                        onClick={() => {
                                            if (page < pageCount) setPage((p) => Math.min(pageCount, p + 1));
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                        </CardContent>
                        <CardFooter />
                    </Card>
                </TabsContent>

                {/* Graphique des écarts */}
                <TabsContent value="lineChart">
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution des écarts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    cashDiscrepancy: {
                                        label: "Écart Cash",
                                        color: "hsla(212, 95%, 38%, 1)",
                                    },
                                    tpeDiscrepancy: {
                                        label: "Écart CB",
                                        color: "hsla(176, 88%, 22%, 1)",
                                    },
                                }}
                            >
                                <AreaChart
                                    width={600}
                                    height={300}
                                    data={chartData}
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        left: 10,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />

                                    <Legend />
                                    <defs>
                                        <linearGradient
                                            id="areaCashDiscrepancy"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="hsla(212, 95%, 38%, 1)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="hsla(212, 95%, 38%, 1)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="areaTpeDiscrepancy"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="hsla(176, 88%, 22%, 1)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="hsla(176, 88%, 22%, 1)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="cashDiscrepancy"
                                        stroke="hsla(212, 95%, 38%, 1)"
                                        fill="url(#areaCashDiscrepancy)"
                                        name="Écart Cash"
                                        connectNulls
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="tpeDiscrepancy"
                                        stroke="hsla(176, 88%, 22%, 1)"
                                        fill="url(#areaTpeDiscrepancy)"
                                        name="Écart CB"
                                        connectNulls
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Répartition Cash */}
                <TabsContent value="stackedBarChart">
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition Cash</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={{
                                    cashToKeep: {
                                        label: "Caisse",
                                        color: "var(--color-cashToKeep)",
                                    },
                                    cashToSafe: {
                                        label: "Coffre",
                                        color: "var(--color-cashToSafe)",
                                    },
                                    extraFlow: {
                                        label: "ExtraFlow",
                                        color: "var(--color-extraFlow)",
                                    },
                                }}
                            >
                                <BarChart
                                    width={600}
                                    height={300}
                                    data={chartData}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Legend />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <defs>
                                        <linearGradient
                                            id="barCashToKeep"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="hsla(176, 88%, 22%, 1)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="hsla(176, 88%, 22%, 1)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="barCashToSafe"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="hsla(212, 95%, 38%, 1)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="hsla(212, 95%, 38%, 1)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="barExtraFlow"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="hsla(360, 74%, 66%, 1)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="hsla(360, 74%, 66%, 1)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <Bar
                                        dataKey="cashToKeep"
                                        stackId="a"
                                        fill="url(#barCashToKeep)"
                                        name="Caisse"
                                    />
                                    <Bar
                                        dataKey="cashToSafe"
                                        stackId="a"
                                        fill="url(#barCashToSafe)"
                                        name="Coffre"
                                    />
                                    <Bar
                                        dataKey="extraFlow"
                                        stackId="a"
                                        fill="url(#barExtraFlow)"
                                        name="ExtraFlow"
                                    />
                                </BarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Évolution du Coffre */}
                <TabsContent value="safeEvolution">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                Évolution Cumulative du Coffre
                            </CardTitle>
                            <CardDescription>
                                Suivi des entrées cumulées dans le coffre :
                                Prime de Noël et Banque.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig}>
                                <AreaChart
                                    data={safeData}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) =>
                                            value.slice(0, 10)
                                        } // Affiche la date
                                    />
                                    <YAxis domain={yAxisDomain} />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent />}
                                    />
                                    <defs>
                                        <linearGradient
                                            id="fillPrimeDeNoel"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="var(--color-primeDeNoel)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--color-primeDeNoel)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="fillBanque"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="var(--color-banque)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--color-banque)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        dataKey="primeDeNoel"
                                        type="natural"
                                        fill="url(#fillPrimeDeNoel)"
                                        fillOpacity={0.4}
                                        stroke="var(--color-primeDeNoel)"
                                        stackId="a"
                                    />
                                    <Area
                                        dataKey="banque"
                                        type="natural"
                                        fill="url(#fillBanque)"
                                        fillOpacity={0.4}
                                        stroke="var(--color-banque)"
                                        stackId="a"
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
