import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartDataPoint {
  date: string;
  cashToKeep: number;
  cashToSafe: number;
  extraFlow: number;
}

interface RecapStackedBarChartProps {
  chartData: ChartDataPoint[];
}

const RecapStackedBarChart: React.FC<RecapStackedBarChartProps> = ({ chartData }) => (
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
        <BarChart width={600} height={300} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Legend />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <defs>
            <linearGradient id="barCashToKeep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsla(176, 88%, 22%, 1)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsla(176, 88%, 22%, 1)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="barCashToSafe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsla(212, 95%, 38%, 1)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsla(212, 95%, 38%, 1)" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="barExtraFlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsla(360, 74%, 66%, 1)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsla(360, 74%, 66%, 1)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Bar dataKey="cashToKeep" stackId="a" fill="url(#barCashToKeep)" name="Caisse" />
          <Bar dataKey="cashToSafe" stackId="a" fill="url(#barCashToSafe)" name="Coffre" />
          <Bar dataKey="extraFlow" stackId="a" fill="url(#barExtraFlow)" name="ExtraFlow" />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export default RecapStackedBarChart;
