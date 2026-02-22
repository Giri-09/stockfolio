"use client";

import { useState, useEffect } from "react";
import { getTimeAgo } from "@/lib/utils";

export default function Header({
  onRefresh,
  lastRefreshed,
  isLoading,
}: {
  onRefresh: () => void;
  lastRefreshed: Date | null;
  isLoading: boolean;
}) {
  const [timeAgo, setTimeAgo] = useState("—");

  useEffect(() => {
    if (!lastRefreshed) return;
    setTimeAgo(getTimeAgo(lastRefreshed));
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(lastRefreshed));
    }, 30000);
    return () => clearInterval(interval);
  }, [lastRefreshed]);

  return (
    <header className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md">
      <div className="mx-auto sm:max-w-[97%] md:max-w-[95%] lg:max-w-[90%] xl:max-w-[86%] 2xl:max-w-[82%] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 sm:h-5 sm:w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            StockFolio
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
              }`}
            />
            <span className="hidden sm:inline">
              {isLoading ? "Updating..." : `Updated ${timeAgo}`}
            </span>
            <span className="sm:hidden">
              {isLoading ? "..." : timeAgo}
            </span>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 sm:p-2 lg:px-3 lg:py-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 sm:h-5 sm:w-5 ${isLoading ? "animate-spin" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            <span className="hidden lg:inline text-sm">Refresh{isLoading ? "ing..." : ""}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
