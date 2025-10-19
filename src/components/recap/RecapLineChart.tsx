import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartDataPoint {
  date: string;
  cashDiscrepancy: number | null;
  tpeDiscrepancy: number | null;
}

interface RecapLineChartProps {
  chartData: ChartDataPoint[];
}

const RecapLineChart: React.FC<RecapLineChartProps> = ({ chartData }) => {
  // Calculer les valeurs cumulatives des écarts
  const cumulativeData = chartData.reduce((acc, entry, index) => {
    const previousEntry = index > 0 ? acc[index - 1] : null;

    // Calculer les cumuls (ignorer les null)
    const cashCumul = entry.cashDiscrepancy !== null
      ? (previousEntry?.cumulativeCashDiscrepancy ?? 0) + entry.cashDiscrepancy
      : (previousEntry?.cumulativeCashDiscrepancy ?? null);

    const tpeCumul = entry.tpeDiscrepancy !== null
      ? (previousEntry?.cumulativeTpeDiscrepancy ?? 0) + entry.tpeDiscrepancy
      : (previousEntry?.cumulativeTpeDiscrepancy ?? null);

    acc.push({
      date: entry.date,
      cumulativeCashDiscrepancy: cashCumul,
      cumulativeTpeDiscrepancy: tpeCumul,
    });

    return acc;
  }, [] as { date: string; cumulativeCashDiscrepancy: number | null; cumulativeTpeDiscrepancy: number | null }[]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution cumulative des écarts</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            cumulativeCashDiscrepancy: {
              label: "Écart Cash cumulé",
              color: "hsla(212, 95%, 38%, 1)",
            },
            cumulativeTpeDiscrepancy: {
              label: "Écart CB cumulé",
              color: "hsla(176, 88%, 22%, 1)",
            },
          }}
        >
          <AreaChart
            width={600}
            height={300}
            data={cumulativeData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Legend />
            <defs>
              <linearGradient id="areaCashDiscrepancy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsla(212, 95%, 38%, 1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsla(212, 95%, 38%, 1)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="areaTpeDiscrepancy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsla(176, 88%, 22%, 1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsla(176, 88%, 22%, 1)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="cumulativeCashDiscrepancy"
              stroke="hsla(212, 95%, 38%, 1)"
              fill="url(#areaCashDiscrepancy)"
              name="Écart Cash cumulé"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="cumulativeTpeDiscrepancy"
              stroke="hsla(176, 88%, 22%, 1)"
              fill="url(#areaTpeDiscrepancy)"
              name="Écart CB cumulé"
              connectNulls
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default RecapLineChart;
