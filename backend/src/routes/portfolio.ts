import { Router } from "express";
import holdings from "../data/holdings.js";
import { getBatchCMP } from "../services/yahooFinance.js";
import { getPEAndEarnings } from "../services/googleFinance.js";
import cache from "../services/cache.js";

const router = Router();

// GET /api/portfolio - Full portfolio data with live CMP, P/E, earnings
router.get("/", async (req, res) => {
  try {
    // Check if full portfolio is cached
    const fullCacheKey = "portfolio_full";
    const cachedPortfolio = cache.get(fullCacheKey);
    if (cachedPortfolio) {
      return res.json(cachedPortfolio);
    }

    // 1. Calculate total investment for portfolio % calculation
    const totalInvestment = holdings.reduce(
      (sum, h) => sum + h.purchasePrice * h.qty,
      0
    );

    // 2. Fetch CMPs from Yahoo AND P/E data from Google concurrently
    //    Google scrapes that don't need CMP (for P/E) can start immediately.
    //    EPS derivation (CMP/PE) happens after both resolve.
    const yahooSymbols = holdings.map((h) => h.yahooSymbol);

    const [cmpMap, googleResults] = await Promise.all([
      // Yahoo Finance — all symbols in parallel
      getBatchCMP(yahooSymbols),
      // Google Finance — all symbols in parallel (just fetches P/E, no CMP needed yet)
      Promise.all(
        holdings.map((h) =>
          (async () => {
            const { peRatio } = await getPEAndEarnings(h.googleSymbol, null);
            return { googleSymbol: h.googleSymbol, peRatio };
          })()
        )
      ),
    ]);

    // Build a quick lookup for Google results
    const googleMap: Record<string, number | null> = {};
    for (const g of googleResults) {
      googleMap[g.googleSymbol] = g.peRatio;
    }

    // 3. Build enriched stock data — derive EPS now that we have both CMP and P/E
    const stocks = holdings.map((h) => {
      const investment = h.purchasePrice * h.qty;
      const cmp = cmpMap[h.yahooSymbol] ?? null;
      const presentValue = cmp !== null ? cmp * h.qty : null;
      const gainLoss = presentValue !== null ? presentValue - investment : null;
      const gainLossPercent =
        gainLoss !== null ? (gainLoss / investment) * 100 : null;

      const peRatio = googleMap[h.googleSymbol] ?? null;
      let latestEarnings: number | null = null;
      if (cmp !== null && peRatio !== null && peRatio > 0) {
        latestEarnings = parseFloat((cmp / peRatio).toFixed(2));
      }

      return {
        name: h.name,
        purchasePrice: h.purchasePrice,
        qty: h.qty,
        investment,
        portfolioPercent: parseFloat(
          ((investment / totalInvestment) * 100).toFixed(1)
        ),
        exchange: h.exchange,
        cmp,
        presentValue: presentValue !== null ? parseFloat(presentValue.toFixed(2)) : null,
        gainLoss: gainLoss !== null ? parseFloat(gainLoss.toFixed(2)) : null,
        gainLossPercent:
          gainLossPercent !== null
            ? parseFloat(gainLossPercent.toFixed(2))
            : null,
        peRatio,
        latestEarnings,
        sector: h.sector,
      };
    });

    // 4. Group by sector
    const sectorMap: Record<string, any[]> = {};
    for (const stock of stocks) {
      if (!sectorMap[stock.sector]) sectorMap[stock.sector] = [];
      sectorMap[stock.sector].push(stock);
    }

    const sectors = Object.entries(sectorMap).map(([sector, sectorStocks]) => {
      const sectorInvestment = sectorStocks.reduce(
        (s, st) => s + st.investment,
        0
      );
      const sectorPresentValue = sectorStocks.every(
        (st) => st.presentValue !== null
      )
        ? sectorStocks.reduce((s, st) => s + st.presentValue, 0)
        : sectorStocks.reduce(
            (s, st) => s + (st.presentValue ?? 0),
            0
          );

      const sectorGainLoss = sectorPresentValue - sectorInvestment;

      return {
        sector,
        totalInvestment: sectorInvestment,
        totalPresentValue: parseFloat(sectorPresentValue.toFixed(2)),
        gainLoss: parseFloat(sectorGainLoss.toFixed(2)),
        gainLossPercent: parseFloat(
          ((sectorGainLoss / sectorInvestment) * 100).toFixed(2)
        ),
        stocks: sectorStocks,
      };
    });

    // 5. Portfolio totals
    const totalPresentValue = stocks.reduce(
      (s, st) => s + (st.presentValue ?? 0),
      0
    );
    const totalGainLoss = totalPresentValue - totalInvestment;

    const response = {
      sectors,
      totals: {
        totalInvestment,
        totalPresentValue: parseFloat(totalPresentValue.toFixed(2)),
        totalGainLoss: parseFloat(totalGainLoss.toFixed(2)),
        totalGainLossPercent: parseFloat(
          ((totalGainLoss / totalInvestment) * 100).toFixed(2)
        ),
      },
      lastUpdated: new Date().toISOString(),
    };

    // Cache for 2 minutes
    cache.set(fullCacheKey, response, 120);

    res.json(response);
  } catch (err: any) {
    console.error("Portfolio fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch portfolio data" });
  }
});

// GET /api/portfolio/refresh - Force refresh (clears only the full portfolio cache)
// Keeps per-symbol caches intact so the next request can reuse them
router.get("/refresh", async (req, res) => {
  cache.del("portfolio_full");
  res.status(200).set("Cache-Control", "no-store").json({ message: "Cache cleared.", timestamp: Date.now() });
});

export default router;
