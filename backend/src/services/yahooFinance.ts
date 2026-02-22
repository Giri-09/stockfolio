import axios from "axios";
import https from "https";
import cache from "./cache.js";

const YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

// Reuse connections across requests — avoids DNS + TLS handshake per call
const agent = new https.Agent({ keepAlive: true, maxSockets: 15 });

async function fetchWithRetry(url: string, options: any, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url, options);
    } catch (err: any) {
      if (attempt === retries) throw err;
      // Brief backoff before retry
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
}

// Fetch CMP (Current Market Price) from Yahoo Finance via HTTP API
export async function getCMP(yahooSymbol: string) {
  const cacheKey = `cmp_${yahooSymbol}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached as number;

  try {
    const { data } = await fetchWithRetry(`${YAHOO_BASE}/${yahooSymbol}`, {
      params: {
        interval: "1d",
        range: "1d",
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      timeout: 5000,
      httpsAgent: agent,
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

// Batch fetch CMP for multiple symbols — all uncached in parallel
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

  // Fetch ALL uncached symbols in parallel (connection reuse via keep-alive agent handles load)
  const promises = uncached.map(async (sym) => {
    const price = await getCMP(sym);
    results[sym] = price;
  });
  await Promise.all(promises);

  return results;
}
