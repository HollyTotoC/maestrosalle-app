import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface SafeDataPoint {
  date: string;
  primeDeNoel: number;
  banque: number;
}

interface RecapSafeEvolutionChartProps {
  safeData: SafeDataPoint[];
  yAxisDomain: [number, number];
  chartConfig: Record<string, { label: string; color: string }>;
}

const RecapSafeEvolutionChart: React.FC<RecapSafeEvolutionChartProps> = ({ safeData, yAxisDomain, chartConfig }) => (
  <Card>
    <CardHeader>
      <CardTitle>Évolution Cumulative du Coffre</CardTitle>
      <CardDescription>
        Suivi des entrées cumulées dans le coffre : Prime de Noël et Banque.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <ChartContainer config={chartConfig}>
        <AreaChart data={safeData} margin={{ left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 10)}
          />
          <YAxis domain={yAxisDomain} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <defs>
            <linearGradient id="fillPrimeDeNoel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primeDeNoel)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-primeDeNoel)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="fillBanque" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-banque)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-banque)" stopOpacity={0.1} />
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
);

export default RecapSafeEvolutionChart;
