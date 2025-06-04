import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartDataPoint {
  date: string;
  cashDiscrepancy: number;
  tpeDiscrepancy: number;
}

interface RecapLineChartProps {
  chartData: ChartDataPoint[];
}

const RecapLineChart: React.FC<RecapLineChartProps> = ({ chartData }) => (
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
);

export default RecapLineChart;
