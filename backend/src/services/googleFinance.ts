import axios from "axios";
import * as cheerio from "cheerio";
import cache from "./cache.js";

// Scrape P/E Ratio from Google Finance
// Google Finance doesn't show EPS directly, so we derive it: EPS = CMP / P/E
export async function getGoogleFinanceData(googleSymbol: string) {
  const cacheKey = `google_${googleSymbol}`;
  const cached = cache.get(cacheKey) as any;
  if (cached) return cached;

  try {
    const url = `https://www.google.com/finance/quote/${googleSymbol}`;

    const { data: html } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(html);

    let peRatio: number | null = null;

    // Google Finance stats rows: .gyFHrc has label (.mfs7Fc) and value (.P6K39c)
    $(".gyFHrc").each((_: any, el: any) => {
      const label = $(el).find(".mfs7Fc").text().trim().toLowerCase();
      const value = $(el).find(".P6K39c").text().trim();

      if (label.includes("p/e ratio")) {
        const parsed = parseFloat(value.replace(/,/g, ""));
        if (!isNaN(parsed)) peRatio = parsed;
      }
    });

    const result = { peRatio };
    cache.set(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error(`Google Finance scrape error for ${googleSymbol}:`, err.message);
    return { peRatio: null };
  }
}

// Get P/E from Google Finance and derive EPS from CMP and P/E
export async function getPEAndEarnings(
  googleSymbol: string,
  cmp: number | null
) {
  const googleData = await getGoogleFinanceData(googleSymbol);
  const peRatio = googleData.peRatio;

  // Latest Earnings (EPS) = CMP / P/E ratio
  let latestEarnings: number | null = null;
  if (cmp !== null && peRatio !== null && peRatio > 0) {
    latestEarnings = parseFloat((cmp / peRatio).toFixed(2));
  }

  return { peRatio, latestEarnings };
}
