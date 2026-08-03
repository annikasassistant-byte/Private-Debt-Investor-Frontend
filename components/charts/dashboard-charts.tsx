"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/types";
import { ChartTooltipContent } from "@/components/charts/chart-tooltip";
import { chartColors } from "@/lib/chart-colors";

// Recharts tooltip props are loosely typed across chart types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipContent = (props: any) => (
  <ChartTooltipContent
    active={props.active}
    payload={props.payload}
    label={props.label != null ? String(props.label) : undefined}
    valuePrefix="€"
  />
);

const tooltipCursor = { stroke: chartColors.muted, strokeWidth: 1, strokeDasharray: "4 4" };

export function PortfolioGrowthChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.35} />
            <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `€${v / 1000}k`}
          width={48}
        />
        <Tooltip content={tooltipContent} cursor={tooltipCursor} />
        <Area
          type="monotone"
          dataKey="value"
          name="Portfolio"
          stroke={chartColors.primary}
          fill="url(#portfolioGrad)"
          strokeWidth={2.5}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function PrincipalInterestChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }} barGap={4}>
        <CartesianGrid stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
        <Tooltip content={tooltipContent} cursor={tooltipCursor} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
        <Bar dataKey="principal" name="Tilgung" fill={chartColors.secondary} radius={[6, 6, 0, 0]} animationDuration={700} />
        <Bar dataKey="interest" name="Finanzierungsgebühr" fill={chartColors.tertiary} radius={[6, 6, 0, 0]} animationDuration={700} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AllocationPieChart({
  data,
}: {
  data: { name: string; value: number; fill: string }[];
}) {
  const fills = [chartColors.primary, chartColors.secondary, chartColors.tertiary, chartColors.quaternary];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={4}
          strokeWidth={0}
          animationDuration={800}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={fills[i % fills.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [`${Number(v ?? 0)}%`, "Allokation"]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function BalanceLineChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.3} />
            <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => `€${v / 1000}k`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={48} />
        <Tooltip content={tooltipContent} cursor={tooltipCursor} />
        <Area
          type="monotone"
          dataKey="value"
          name="Saldo"
          stroke={chartColors.primary}
          fill="url(#balanceGrad)"
          strokeWidth={2.5}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
