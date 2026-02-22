"use client";

import { useState } from "react";
import { formatCompact } from "@/lib/utils";
import StockTable from "./StockTable";

export default function SectorCard({ sector }: { sector: any }) {
  const [isOpen, setIsOpen] = useState(true);
  const isProfit = sector.gainLoss >= 0;
  const plColor = isProfit ? "text-green-400" : "text-red-400";
  const arrow = isProfit ? "▲" : "▼";

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-white font-semibold text-sm sm:text-base">
            {sector.sector}
          </span>
          <span className="text-xs text-gray-500 hidden sm:inline">
            {sector.stocks.length} stocks
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm">
          <div className="text-right hidden md:block">
            <span className="text-gray-500">Invested </span>
            <span className="text-gray-300">{formatCompact(sector.totalInvestment)}</span>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-gray-500">Current </span>
            <span className="text-white">{formatCompact(sector.totalPresentValue)}</span>
          </div>
          <div className={`text-right font-medium ${plColor}`}>
            <span>{arrow} {Math.abs(sector.gainLossPercent)}%</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-white/5 px-2 sm:px-3 pb-3">
          <StockTable stocks={sector.stocks} />
        </div>
      )}
    </div>
  );
}
