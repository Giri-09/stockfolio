import axios from "axios";
import cache from "./cache";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

// Fetch CMP (Current Market Price) from Yahoo Finance via HTTP API
export async function getCMP(yahooSymbol: string) {
  const cacheKey = `cmp_${yahooSymbol}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached as number;

  try {
    const { data } = await axios.get(`${YAHOO_BASE}/${yahooSymbol}`, {
      params: {
        interval: "1d",
        range: "1d",
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 10000,
    });

    const result = data?.chart?.result?.[0];
    const price =
      result?.meta?.regularMarketPrice ?? null;

    if (price !== null) {
      cache.set(cacheKey, price);
    }
    return price as number | null;
  } catch (err: any) {
    console.error(`Yahoo Finance error for ${yahooSymbol}:`, err.message);
    return null;
  }
}

// Batch fetch CMP for multiple symbols
export async function getBatchCMP(symbols: string[]) {
  const results: any = {};

  const uncached: string[] = [];
  for (const sym of symbols) {
    const cached = cache.get(`cmp_${sym}`);
    if (cached !== undefined) {
      results[sym] = cached;
    } else {
      uncached.push(sym);
    }
  }

  // Fetch in parallel batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < uncached.length; i += batchSize) {
    const batch = uncached.slice(i, i + batchSize);
    const promises = batch.map(async (sym) => {
      const price = await getCMP(sym);
      results[sym] = price;
    });
    await Promise.all(promises);
  }

  return results;
}
