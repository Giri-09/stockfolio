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

    // 2. Fetch all CMPs from Yahoo Finance in batch
    const yahooSymbols = holdings.map((h) => h.yahooSymbol);
    const cmpMap = await getBatchCMP(yahooSymbols);

    // 3. Fetch P/E and Earnings from Google Finance (pass CMP to derive EPS)
    const pePromises = holdings.map((h) =>
      getPEAndEarnings(h.googleSymbol, cmpMap[h.yahooSymbol] ?? null)
    );
    const peResults = await Promise.all(pePromises);

    // 4. Build enriched stock data
    const stocks = holdings.map((h, i) => {
      const investment = h.purchasePrice * h.qty;
      const cmp = cmpMap[h.yahooSymbol] ?? null;
      const presentValue = cmp !== null ? cmp * h.qty : null;
      const gainLoss = presentValue !== null ? presentValue - investment : null;
      const gainLossPercent =
        gainLoss !== null ? (gainLoss / investment) * 100 : null;

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
        peRatio: peResults[i].peRatio,
        latestEarnings: peResults[i].latestEarnings,
        sector: h.sector,
      };
    });

    // 5. Group by sector
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

    // 6. Portfolio totals
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

// GET /api/portfolio/holdings - Just the static holdings data (no live data)
router.get("/holdings", (req, res) => {
  const totalInvestment = holdings.reduce(
    (sum, h) => sum + h.purchasePrice * h.qty,
    0
  );

  const data = holdings.map((h) => {
    const investment = h.purchasePrice * h.qty;
    return {
      name: h.name,
      purchasePrice: h.purchasePrice,
      qty: h.qty,
      investment,
      portfolioPercent: parseFloat(
        ((investment / totalInvestment) * 100).toFixed(1)
      ),
      exchange: h.exchange,
      sector: h.sector,
    };
  });

  res.json({ holdings: data, totalInvestment });
});

// GET /api/portfolio/refresh - Force refresh (clears cache)
router.get("/refresh", async (req, res) => {
  cache.flushAll();
  res.json({ message: "Cache cleared. Next request will fetch fresh data." });
});

export default router;
