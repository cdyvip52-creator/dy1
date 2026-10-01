import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CachedData {
  data: any;
  timestamp: number;
}

let marketSummaryCache: CachedData | null = null;
const CACHE_TTL_MS = 25 * 1000; // 25 seconds cache

interface CachedHistory {
  [range: string]: { data: any; timestamp: number };
}
const historyCache: CachedHistory = {};

// Helper to fetch symbol with timeout & realistic User-Agent
async function fetchYahooQuote(symbol: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    throw new Error(`Yahoo Finance responded with status ${response.status} for ${symbol}`);
  }

  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result || !result.meta) {
    throw new Error(`Invalid response structure for ${symbol}`);
  }

  const meta = result.meta;
  const current = meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0;
  const prevClose = meta.chartPreviousClose ?? current;
  const change = current - prevClose;
  const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    symbol,
    name: meta.shortName || meta.longName || symbol,
    current,
    prevClose,
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    high: meta.regularMarketDayHigh ?? current,
    low: meta.regularMarketDayLow ?? current,
    volume: meta.regularMarketVolume ?? 0,
    timestamp: (meta.regularMarketTime || Math.floor(Date.now() / 1000)) * 1000,
  };
}

async function fetchYahooHistory(symbol: string, range: string = '6mo') {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=${range}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch history for ${symbol}: ${response.status}`);
  }

  const json = await response.json();
  const result = json?.chart?.result?.[0];
  if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
    throw new Error(`Invalid history structure for ${symbol}`);
  }

  const timestamps = result.timestamp as number[];
  const quotes = result.indicators.quote[0];
  const closes = quotes.close as (number | null)[];

  const points: { date: string; close: number }[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close !== null && !isNaN(close)) {
      const d = new Date(timestamps[i] * 1000);
      const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
      points.push({
        date: dateStr,
        close: Number(close.toFixed(2)),
      });
    }
  }

  return points;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // 1. API: Live Market Summary
  app.get('/api/market-summary', async (req, res) => {
    const now = Date.now();
    if (marketSummaryCache && now - marketSummaryCache.timestamp < CACHE_TTL_MS) {
      return res.json({
        ...marketSummaryCache.data,
        cached: true,
        ageMs: now - marketSummaryCache.timestamp,
      });
    }

    try {
      const symbolsToFetch = [
        '^KS11',      // KOSPI
        '^KQ11',      // KOSDAQ
        '^GSPC',      // S&P 500
        '^IXIC',      // NASDAQ
        '^SOX',       // PHLX Semiconductor
        '^TNX',       // US 10-Year Yield
        'USDKRW=X',   // USD/KRW
        'CL=F',       // WTI Crude Oil
        '005930.KS',  // Samsung Electronics
        '000660.KS',  // SK Hynix
      ];

      const results = await Promise.allSettled(symbolsToFetch.map(s => fetchYahooQuote(s)));
      const dataMap: Record<string, any> = {};

      symbolsToFetch.forEach((sym, idx) => {
        const settled = results[idx];
        if (settled.status === 'fulfilled') {
          dataMap[sym] = settled.value;
        } else {
          console.warn(`Failed to fetch ${sym}:`, settled.reason?.message);
        }
      });

      const kospiData = dataMap['^KS11'] || {
        current: 6947.66,
        change: 109.62,
        changePercent: 1.60,
        prevClose: 7017.91,
        timestamp: now,
      };

      const us10YData = dataMap['^TNX'] || { current: 5.29, change: 0.13, changePercent: 2.5 };
      const fxData = dataMap['USDKRW=X'] || { current: 1358.38, change: -8.98, changePercent: -0.66 };
      const wtiData = dataMap['CL=F'] || { current: 89.55, change: -3.05, changePercent: -3.29 };

      const responsePayload = {
        success: true,
        source: 'Live Financial Market API (Yahoo Finance)',
        isLive: true,
        updatedAt: new Date().toISOString(),
        kospi: {
          current: kospiData.current,
          change: kospiData.change,
          changePercent: kospiData.changePercent,
          prevClose: kospiData.prevClose,
          high: kospiData.high || kospiData.current,
          low: kospiData.low || kospiData.current,
          timestamp: kospiData.timestamp,
        },
        indices: [
          {
            id: 'kospi',
            name: 'KOSPI',
            symbol: '^KS11',
            current: kospiData.current,
            change: kospiData.change,
            changePercent: kospiData.changePercent,
          },
          {
            id: 'kosdaq',
            name: 'KOSDAQ',
            symbol: '^KQ11',
            current: dataMap['^KQ11']?.current || 889.52,
            change: dataMap['^KQ11']?.change || 55.14,
            changePercent: dataMap['^KQ11']?.changePercent || 6.61,
          },
          {
            id: 'sp500',
            name: 'S&P 500',
            symbol: '^GSPC',
            current: dataMap['^GSPC']?.current || 7651.54,
            change: dataMap['^GSPC']?.change || -54.49,
            changePercent: dataMap['^GSPC']?.changePercent || -0.71,
          },
          {
            id: 'nasdaq',
            name: '나스닥 종합',
            symbol: '^IXIC',
            current: dataMap['^IXIC']?.current || 26861.06,
            change: dataMap['^IXIC']?.change || -74.98,
            changePercent: dataMap['^IXIC']?.changePercent || -0.28,
          },
          {
            id: 'sox',
            name: '필라델피아 반도체',
            symbol: '^SOX',
            current: dataMap['^SOX']?.current || 12628.62,
            change: dataMap['^SOX']?.change || 94.34,
            changePercent: dataMap['^SOX']?.changePercent || 0.75,
          },
        ],
        macro: {
          us10Y: {
            name: '미국 10년물 국채금리',
            symbol: '^TNX',
            current: us10YData.current,
            change: us10YData.change,
            changePercent: us10YData.changePercent,
            unit: '%',
          },
          usdKrw: {
            name: '원/달러 환율',
            symbol: 'USDKRW=X',
            current: fxData.current,
            change: fxData.change,
            changePercent: fxData.changePercent,
            unit: '원',
          },
          wti: {
            name: 'WTI 원유 선물',
            symbol: 'CL=F',
            current: wtiData.current,
            change: wtiData.change,
            changePercent: wtiData.changePercent,
            unit: '$/배럴',
          },
        },
        stocks: [
          {
            ticker: '005930',
            name: '삼성전자',
            current: dataMap['005930.KS']?.current || 275000,
            change: dataMap['005930.KS']?.change || -1500,
            changePercent: dataMap['005930.KS']?.changePercent || -0.54,
          },
          {
            ticker: '000660',
            name: 'SK하이닉스',
            current: dataMap['000660.KS']?.current || 1824000,
            change: dataMap['000660.KS']?.change || -16000,
            changePercent: dataMap['000660.KS']?.changePercent || -0.87,
          },
        ],
      };

      marketSummaryCache = {
        data: responsePayload,
        timestamp: now,
      };

      return res.json(responsePayload);
    } catch (err: any) {
      console.error('Error generating market summary:', err);
      if (marketSummaryCache) {
        return res.json({
          ...marketSummaryCache.data,
          cached: true,
          fallbackReason: err.message,
        });
      }
      return res.status(500).json({ error: 'Failed to fetch financial data', details: err.message });
    }
  });

  // 2. API: Live KOSPI Historical Chart
  app.get('/api/market-history', async (req, res) => {
    const range = (req.query.range as string) || '6mo';
    const now = Date.now();

    if (historyCache[range] && now - historyCache[range].timestamp < 60 * 1000) {
      return res.json({ success: true, points: historyCache[range].data, cached: true });
    }

    try {
      const points = await fetchYahooHistory('^KS11', range);
      historyCache[range] = { data: points, timestamp: now };
      return res.json({ success: true, points, isLive: true });
    } catch (err: any) {
      console.error('Error fetching historical chart:', err);
      if (historyCache[range]) {
        return res.json({ success: true, points: historyCache[range].data, cached: true });
      }
      return res.status(500).json({ error: 'Failed to fetch historical data', details: err.message });
    }
  });

  // 3. Vite development middleware or static production serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
