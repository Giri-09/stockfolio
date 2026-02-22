"use client";

import { formatINR, formatNumber } from "@/lib/utils";

export default function StockTable({ stocks }: { stocks: any[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/10">
            <th className="text-left py-2 px-3 font-medium">Stock</th>
            <th className="text-right py-2 px-3 font-medium">Buy</th>
            <th className="text-right py-2 px-3 font-medium">Qty</th>
            <th className="text-right py-2 px-3 font-medium">CMP</th>
            <th className="text-right py-2 px-3 font-medium">Invested</th>
            <th className="text-right py-2 px-3 font-medium">Current</th>
            <th className="text-right py-2 px-3 font-medium">P&L</th>
            <th className="text-right py-2 px-3 font-medium">P&L %</th>
            <th className="text-right py-2 px-3 font-medium">P/E</th>
            <th className="text-right py-2 px-3 font-medium">EPS</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock: any) => {
            const isProfit = stock.gainLoss !== null && stock.gainLoss >= 0;
            const plColor =
              stock.gainLoss === null
                ? "text-gray-500"
                : isProfit
                  ? "text-green-400"
                  : "text-red-400";

            return (
              <tr
                key={stock.name}
                className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
              >
                <td className="py-2.5 px-3 text-white font-medium whitespace-nowrap">
                  {stock.name}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-300">
                  {formatINR(stock.purchasePrice)}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-300">
                  {stock.qty}
                </td>
                <td className="py-2.5 px-3 text-right text-white font-medium">
                  {stock.cmp !== null ? formatINR(stock.cmp) : "—"}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-300">
                  {formatINR(stock.investment)}
                </td>
                <td className="py-2.5 px-3 text-right text-white">
                  {stock.presentValue !== null ? formatINR(stock.presentValue) : "—"}
                </td>
                <td className={`py-2.5 px-3 text-right font-medium ${plColor}`}>
                  {stock.gainLoss !== null
                    ? `${isProfit ? "+" : ""}${formatINR(stock.gainLoss)}`
                    : "—"}
                </td>
                <td className={`py-2.5 px-3 text-right font-medium ${plColor}`}>
                  {stock.gainLossPercent !== null
                    ? `${isProfit ? "+" : ""}${stock.gainLossPercent}%`
                    : "—"}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-400">
                  {stock.peRatio !== null ? formatNumber(stock.peRatio) : "—"}
                </td>
                <td className="py-2.5 px-3 text-right text-gray-400">
                  {stock.latestEarnings !== null
                    ? formatNumber(stock.latestEarnings)
                    : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
