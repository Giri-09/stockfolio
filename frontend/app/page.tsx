"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioSummary from "@/components/PortfolioSummary";
import SectorCard from "@/components/SectorCard";
import LoadingState from "@/components/LoadingState";
import { fetchPortfolio, refreshPortfolio } from "@/lib/api";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchPortfolio();
      setData(result);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch portfolio data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await refreshPortfolio();
      setData(result);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to refresh portfolio data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="h-screen flex flex-col relative bg-black overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 70% 20%, rgba(255, 20, 147, 0.15), transparent 50%),
            radial-gradient(ellipse 100% 60% at 30% 10%, rgba(0, 255, 255, 0.12), transparent 60%),
            radial-gradient(ellipse 90% 70% at 50% 0%, rgba(138, 43, 226, 0.18), transparent 65%),
            radial-gradient(ellipse 110% 50% at 80% 30%, rgba(255, 215, 0, 0.08), transparent 40%),
            #000000
          `,
        }}
      />

      <Header
        onRefresh={handleRefresh}
        lastRefreshed={lastRefreshed}
        isLoading={loading}
      />

      <main className="relative z-10 flex-1 overflow-y-auto flex flex-col">
        <div className="flex-1 mx-auto w-full sm:max-w-[97%] md:max-w-[95%] lg:max-w-[90%] xl:max-w-[86%] 2xl:max-w-[82%] px-4 sm:px-6 py-4 sm:py-6">
          {loading && !data ? (
            <LoadingState />
          ) : error && !data ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 backdrop-blur-sm p-6 sm:p-8 text-center max-w-md">
                <p className="text-red-400 text-lg font-semibold mb-2">
                  Something went wrong
                </p>
                <p className="text-gray-400 text-sm mb-4">{error}</p>
                <button
                  onClick={loadData}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-4 sm:space-y-6">
              <PortfolioSummary totals={data.totals} />
              <div className="space-y-3">
                {data.sectors.map((sector: any) => (
                  <SectorCard key={sector.sector} sector={sector} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <Footer />
      </main>
    </div>
  );
}
