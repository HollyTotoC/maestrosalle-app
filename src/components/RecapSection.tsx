"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import { useEffect, useState } from "react";
import { useClosuresStore } from "@/store/useClosuresStore";
import { useAppStore } from "@/store/store";
import { updateClosuresIfNeeded } from "@/hooks/useClosures";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { parse, formatHsl } from "culori";

function convertOklchToHsl(oklchColor: string): string {
  const parsed = parse(oklchColor);
  return parsed ? formatHsl(parsed) : "hsl(0, 0%, 0%)";
}

const chartConfig = {
  primeDeNoel: {
    label: "Prime de Noël",
    color: convertOklchToHsl("oklch(var(--chart-1))"),
  },
  banque: {
    label: "Banque",
    color: convertOklchToHsl("oklch(var(--chart-2))"),
  },
};

export default function RecapSection() {
  const [loading, setLoading] = useState(true);
  const closures = useClosuresStore((state) => state.closures);
  const selectedRestaurant = useAppStore((state) => state.selectedRestaurant);

  useEffect(() => {
    if (!selectedRestaurant?.id) return;

    async function fetchData() {
      setLoading(true);
      if (selectedRestaurant?.id) {
        await updateClosuresIfNeeded(selectedRestaurant.id);
      }
      setLoading(false);
    }

    fetchData();
  }, [selectedRestaurant]);

  if (loading) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-neutral-900 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (closures.length === 0) {
    return (
      <div className="p-4 bg-gray-100 dark:bg-neutral-900 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
        <p>Aucune donnée disponible pour ce restaurant.</p>
      </div>
    );
  }

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
  const allDates = getDateRange(rawDates[0], rawDates[rawDates.length - 1]);

  // Créer une map des données des clôtures
  const closureMap = new Map(
    closures.map((entry) => [
      new Date(entry.date.seconds * 1000).toISOString().split("T")[0],
      {
        cashDiscrepancy: entry.cashDiscrepancy,
        tpeDiscrepancy: entry.tpeDiscrepancy,
        cashToKeep: entry.cashToKeep,
        cashToSafe: entry.cashToSafe,
        extraFlow: entry.extraFlowEntries?.reduce((sum, e) => sum + e.amount, 0),
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

  const safeData = chartData.reduce<{ date: string; primeDeNoel: number; banque: number }[]>(
    (acc, entry, index) => {
      const previous = acc[index - 1] || { primeDeNoel: 0, banque: 0 };
      acc.push({
        date: entry.date,
        primeDeNoel: previous.primeDeNoel + (entry.extraFlow ?? 0),
        banque: previous.banque + ((entry.cashToSafe ?? 0) - (entry.extraFlow ?? 0)),
      });
      return acc;
    },
    []
  );

  const yAxisDomain = [
    Math.min(...safeData.map((d) => Math.min(d.primeDeNoel, d.banque))),
    Math.max(...safeData.map((d) => Math.max(d.primeDeNoel, d.banque))),
  ];

  return (
    <div className="p-4 bg-gray-100 dark:bg-neutral-900 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Tableau</TabsTrigger>
          <TabsTrigger value="lineChart">Évolution des écarts</TabsTrigger>
          <TabsTrigger value="stackedBarChart">Répartition Cash</TabsTrigger>
          <TabsTrigger value="safeEvolution">Évolution du Coffre</TabsTrigger>
        </TabsList>

        {/* Vue Tableau */}
        <TabsContent value="table">
          <Table >
            <TableCaption>Récapitulatif des clôtures de caisse.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Coffre (€)</TableHead>
                <TableHead>Caisse (€)</TableHead>
                <TableHead>ExtraFlow (€)</TableHead>
                <TableHead>Écart CB (€)</TableHead>
                <TableHead>Écart Cash (€)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chartData.map((entry) => {
                const isMissingData =
                  entry.cashToSafe == null &&
                  entry.cashToKeep == null &&
                  entry.cashDiscrepancy == null &&
                  entry.tpeDiscrepancy == null &&
                  (entry.extraFlow == null || entry.extraFlow === 0);

                console.log("entry.date:", entry.date);
                console.log("entry.cashToSafe:", entry.cashToSafe);
                console.log("entry.cashToKeep:", entry.cashToKeep);
                console.log("entry.extraFlow:", entry.extraFlow);
                console.log("entry.cashDiscrepancy:", entry.cashDiscrepancy);
                console.log("entry.tpeDiscrepancy:", entry.tpeDiscrepancy);
                console.log("isMissingData:", isMissingData);

                return (
                  <TableRow
                    key={entry.date}
                    className={isMissingData ? " text-gray-500" : "bg-white dark:bg-black"}
                  >
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.cashToSafe !== null ? `${entry.cashToSafe} €` : "N/A"}</TableCell>
                    <TableCell>{entry.cashToKeep !== null ? `${entry.cashToKeep} €` : "N/A"}</TableCell>
                    <TableCell>{entry.extraFlow !== null ? `${entry.extraFlow} €` : "N/A"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.tpeDiscrepancy === null
                            ? "default"
                            : entry.tpeDiscrepancy < 5
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {entry.tpeDiscrepancy !== null ? `${entry.tpeDiscrepancy} €` : "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.cashDiscrepancy === null
                            ? "default"
                            : entry.cashDiscrepancy < 5
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {entry.cashDiscrepancy !== null ? `${entry.cashDiscrepancy} €` : "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Graphique des écarts */}
        <TabsContent value="lineChart">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des écarts</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChart
                width={600}
                height={300}
                data={chartData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cashDiscrepancy"
                  stroke="hsl(var(--chart-1))"
                  name="Écart Cash"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="tpeDiscrepancy"
                  stroke="hsl(var(--chart-2))"
                  name="Écart CB"
                  connectNulls
                />
              </LineChart>
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
              <BarChart width={600} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="cashToKeep" stackId="a" fill="#4CAF50" name="Caisse" />
                <Bar dataKey="cashToSafe" stackId="a" fill="#FFC107" name="Coffre" />
                <Bar dataKey="extraFlow" stackId="a" fill="#F44336" name="ExtraFlow" />
              </BarChart>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Évolution du Coffre */}
        <TabsContent value="safeEvolution">
          <Card>
            <CardHeader>
              <CardTitle>Évolution Cumulative du Coffre</CardTitle>
              <CardDescription>
                Suivi des entrées cumulées dans le coffre : Prime de Noël et Banque.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={chartConfig}
              >
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
                    tickFormatter={(value) => value.slice(0, 10)} // Affiche la date
                  />
                  <YAxis domain={yAxisDomain} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="fillPrimeDeNoel" x1="0" y1="0" x2="0" y2="1">
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
                    <linearGradient id="fillBanque" x1="0" y1="0" x2="0" y2="1">
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