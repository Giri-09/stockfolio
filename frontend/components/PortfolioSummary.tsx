"use client";

import { formatCompact } from "@/lib/utils";

function SummaryCard({
  label,
  value,
  subValue,
  color,
}: {
  label: string;
  value: string;
  subValue?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-4 sm:p-5">
      <p className="text-xs sm:text-sm text-gray-400 mb-1">{label}</p>
      <p className={`text-lg sm:text-2xl font-bold ${color}`}>{value}</p>
      {subValue && (
        <p className={`text-xs sm:text-sm mt-1 ${color} opacity-80`}>{subValue}</p>
      )}
    </div>
  );
}

export default function PortfolioSummary({ totals }: { totals: any }) {
  const isProfit = totals.totalGainLoss >= 0;
  const plColor = isProfit ? "text-green-400" : "text-red-400";
  const arrow = isProfit ? "▲" : "▼";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <SummaryCard
        label="Total Invested"
        value={formatCompact(totals.totalInvestment)}
        color="text-white"
      />
      <SummaryCard
        label="Current Value"
        value={formatCompact(totals.totalPresentValue)}
        color="text-white"
      />
      <SummaryCard
        label="Total P&L"
        value={`${isProfit ? "+" : ""}${formatCompact(totals.totalGainLoss)}`}
        color={plColor}
      />
      <SummaryCard
        label="Overall Returns"
        value={`${arrow} ${Math.abs(totals.totalGainLossPercent)}%`}
        subValue={isProfit ? "Profit" : "Loss"}
        color={plColor}
      />
    </div>
  );
}
