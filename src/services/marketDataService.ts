import { IndexMetric, HistoricalPricePoint, FiveYearMacroDataPoint } from '../types/market';

export const IS_DEMO_DATA = true;
export const DATA_SOURCE_LABEL = '금융투자협회·KRX·Bloomberg 가상 시뮬레이션 [데모 데이터]';

export const CURRENT_KOSPI_INDEX = 3520.45;

export const INITIAL_INDICES: IndexMetric[] = [
  {
    id: 'kospi',
    name: 'KOSPI',
    symbol: 'KS11',
    current: 3520.45,
    change: 22.80,
    changePercent: 0.65,
    change1W: 1.42,
    change1M: 3.85,
    change3M: 8.60,
    updatedAt: '2026.09.30',
  },
  {
    id: 'kospi200',
    name: 'KOSPI 200',
    symbol: 'KS200',
    current: 472.10,
    change: 3.45,
    changePercent: 0.74,
    change1W: 1.68,
    change1M: 4.12,
    change3M: 9.25,
    updatedAt: '2026.09.30',
  },
  {
    id: 'kosdaq',
    name: 'KOSDAQ',
    symbol: 'KQ11',
    current: 855.20,
    change: -4.10,
    changePercent: -0.48,
    change1W: -0.85,
    change1M: 1.20,
    change3M: 3.10,
    updatedAt: '2026.09.30',
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    symbol: 'SPX',
    current: 5885.60,
    change: 18.25,
    changePercent: 0.31,
    change1W: 0.95,
    change1M: 2.80,
    change3M: 6.40,
    updatedAt: '2026.09.30',
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ',
    symbol: 'COMP',
    current: 18640.80,
    change: 85.40,
    changePercent: 0.46,
    change1W: 1.25,
    change1M: 3.65,
    change3M: 7.90,
    updatedAt: '2026.09.30',
  },
  {
    id: 'sox',
    name: '필라델피아 반도체',
    symbol: 'SOX',
    current: 5240.15,
    change: 62.30,
    changePercent: 1.20,
    change1W: 2.85,
    change1M: 6.40,
    change3M: 14.20,
    updatedAt: '2026.09.30',
  },
];

// Historical monthly/quarterly data for 12 months (past) + anchor point today
export const HISTORICAL_KOSPI_DATA: HistoricalPricePoint[] = [
  { date: '2025.10', close: 3120, label: '1년 전' },
  { date: '2025.11', close: 3180 },
  { date: '2025.12', close: 3260, label: '연말 배당' },
  { date: '2026.01', close: 3290 },
  { date: '2026.02', close: 3220, label: '금리 경계감' },
  { date: '2026.03', close: 3310 },
  { date: '2026.04', close: 3385, label: '반도체 실적개선' },
  { date: '2026.05', close: 3420 },
  { date: '2026.06', close: 3390 },
  { date: '2026.07', close: 3465 },
  { date: '2026.08', close: 3495 },
  { date: '2026.09', close: 3520, label: '현재 기준' },
];

// 5-Year Historical Macro & Valuation Dataset (Monthly 2021.10 ~ 2026.09)
export const FIVE_YEAR_HISTORICAL_DATA: FiveYearMacroDataPoint[] = [
  { date: '2021.10', kospi: 2970, fwdPer: 10.9, us10Y: 1.56, usdKrw: 1175, eventLabel: '테이퍼링 논의' },
  { date: '2021.11', kospi: 2840, fwdPer: 10.4, us10Y: 1.45, usdKrw: 1188 },
  { date: '2021.12', kospi: 2978, fwdPer: 10.8, us10Y: 1.51, usdKrw: 1189, eventLabel: '연말 배당' },
  { date: '2022.01', kospi: 2663, fwdPer: 9.8, us10Y: 1.78, usdKrw: 1205, eventLabel: '연준 긴축 가속' },
  { date: '2022.02', kospi: 2699, fwdPer: 10.0, us10Y: 1.83, usdKrw: 1202 },
  { date: '2022.03', kospi: 2758, fwdPer: 10.3, us10Y: 2.34, usdKrw: 1212, eventLabel: '미 연준 금리인상 착수' },
  { date: '2022.04', kospi: 2695, fwdPer: 9.9, us10Y: 2.93, usdKrw: 1256 },
  { date: '2022.05', kospi: 2686, fwdPer: 9.8, us10Y: 2.84, usdKrw: 1237 },
  { date: '2022.06', kospi: 2333, fwdPer: 8.6, us10Y: 3.01, usdKrw: 1297, eventLabel: '자이언트스텝 충격' },
  { date: '2022.07', kospi: 2452, fwdPer: 9.2, us10Y: 2.65, usdKrw: 1304 },
  { date: '2022.08', kospi: 2472, fwdPer: 9.4, us10Y: 3.19, usdKrw: 1337 },
  { date: '2022.09', kospi: 2155, fwdPer: 8.2, us10Y: 3.83, usdKrw: 1430, eventLabel: '환율 1,440원 & 지수 저점' },
  { date: '2022.10', kospi: 2294, fwdPer: 8.8, us10Y: 4.05, usdKrw: 1424 },
  { date: '2022.11', kospi: 2473, fwdPer: 9.5, us10Y: 3.61, usdKrw: 1318 },
  { date: '2022.12', kospi: 2236, fwdPer: 8.7, us10Y: 3.87, usdKrw: 1264 },
  { date: '2023.01', kospi: 2425, fwdPer: 9.6, us10Y: 3.51, usdKrw: 1231 },
  { date: '2023.02', kospi: 2412, fwdPer: 9.8, us10Y: 3.92, usdKrw: 1301 },
  { date: '2023.03', kospi: 2477, fwdPer: 10.2, us10Y: 3.47, usdKrw: 1302, eventLabel: '미국 SVB 사태' },
  { date: '2023.04', kospi: 2501, fwdPer: 10.6, us10Y: 3.42, usdKrw: 1337 },
  { date: '2023.05', kospi: 2577, fwdPer: 11.2, us10Y: 3.64, usdKrw: 1325 },
  { date: '2023.06', kospi: 2564, fwdPer: 11.3, us10Y: 3.84, usdKrw: 1317 },
  { date: '2023.07', kospi: 2632, fwdPer: 11.8, us10Y: 3.96, usdKrw: 1277 },
  { date: '2023.08', kospi: 2556, fwdPer: 11.4, us10Y: 4.11, usdKrw: 1322 },
  { date: '2023.09', kospi: 2465, fwdPer: 10.8, us10Y: 4.57, usdKrw: 1349 },
  { date: '2023.10', kospi: 2277, fwdPer: 9.9, us10Y: 4.93, usdKrw: 1350, eventLabel: '미 10년물 5.0% 육박' },
  { date: '2023.11', kospi: 2535, fwdPer: 11.1, us10Y: 4.33, usdKrw: 1290, eventLabel: '공매도 전면 금지' },
  { date: '2023.12', kospi: 2655, fwdPer: 11.6, us10Y: 3.88, usdKrw: 1288 },
  { date: '2024.01', kospi: 2497, fwdPer: 10.7, us10Y: 3.91, usdKrw: 1334 },
  { date: '2024.02', kospi: 2642, fwdPer: 11.1, us10Y: 4.25, usdKrw: 1331, eventLabel: '기업 밸류업 프로그램' },
  { date: '2024.03', kospi: 2746, fwdPer: 11.4, us10Y: 4.20, usdKrw: 1347 },
  { date: '2024.04', kospi: 2692, fwdPer: 10.8, us10Y: 4.68, usdKrw: 1382 },
  { date: '2024.05', kospi: 2636, fwdPer: 10.4, us10Y: 4.50, usdKrw: 1384 },
  { date: '2024.06', kospi: 2797, fwdPer: 10.9, us10Y: 4.40, usdKrw: 1376, eventLabel: 'HBM 반도체 랠리' },
  { date: '2024.07', kospi: 2770, fwdPer: 10.6, us10Y: 4.03, usdKrw: 1378 },
  { date: '2024.08', kospi: 2674, fwdPer: 9.8, us10Y: 3.90, usdKrw: 1336, eventLabel: '엔캐리 청산 충격' },
  { date: '2024.09', kospi: 2593, fwdPer: 9.3, us10Y: 3.78, usdKrw: 1307, eventLabel: '연준 빅컷(50bp)' },
  { date: '2024.10', kospi: 2556, fwdPer: 9.0, us10Y: 4.28, usdKrw: 1379 },
  { date: '2024.11', kospi: 2455, fwdPer: 8.6, us10Y: 4.17, usdKrw: 1395 },
  { date: '2024.12', kospi: 2580, fwdPer: 9.1, us10Y: 4.57, usdKrw: 1470 },
  { date: '2025.01', kospi: 2620, fwdPer: 9.2, us10Y: 4.53, usdKrw: 1445 },
  { date: '2025.02', kospi: 2680, fwdPer: 9.4, us10Y: 4.30, usdKrw: 1430 },
  { date: '2025.03', kospi: 2740, fwdPer: 9.5, us10Y: 4.22, usdKrw: 1410 },
  { date: '2025.04', kospi: 2750, fwdPer: 9.4, us10Y: 4.35, usdKrw: 1395, eventLabel: '과거 전망 시점 [25.04]' },
  { date: '2025.05', kospi: 2820, fwdPer: 9.6, us10Y: 4.38, usdKrw: 1385 },
  { date: '2025.06', kospi: 2890, fwdPer: 9.8, us10Y: 4.25, usdKrw: 1370 },
  { date: '2025.07', kospi: 2980, fwdPer: 10.1, us10Y: 4.18, usdKrw: 1365 },
  { date: '2025.08', kospi: 3040, fwdPer: 10.2, us10Y: 4.25, usdKrw: 1375 },
  { date: '2025.09', kospi: 3080, fwdPer: 10.3, us10Y: 4.15, usdKrw: 1360 },
  { date: '2025.10', kospi: 3120, fwdPer: 10.2, us10Y: 4.10, usdKrw: 1355, eventLabel: '과거 전망 시점 [25.10]' },
  { date: '2025.11', kospi: 3180, fwdPer: 10.4, us10Y: 4.05, usdKrw: 1350 },
  { date: '2025.12', kospi: 3260, fwdPer: 10.5, us10Y: 4.12, usdKrw: 1360 },
  { date: '2026.01', kospi: 3290, fwdPer: 10.4, us10Y: 4.24, usdKrw: 1370 },
  { date: '2026.02', kospi: 3220, fwdPer: 10.0, us10Y: 4.38, usdKrw: 1385, eventLabel: '금리 경계감' },
  { date: '2026.03', kospi: 3310, fwdPer: 10.2, us10Y: 4.30, usdKrw: 1380 },
  { date: '2026.04', kospi: 3385, fwdPer: 10.3, us10Y: 4.35, usdKrw: 1375, eventLabel: '과거 전망 시점 [26.04]' },
  { date: '2026.05', kospi: 3420, fwdPer: 10.3, us10Y: 4.28, usdKrw: 1372 },
  { date: '2026.06', kospi: 3390, fwdPer: 10.1, us10Y: 4.32, usdKrw: 1380 },
  { date: '2026.07', kospi: 3465, fwdPer: 10.2, us10Y: 4.20, usdKrw: 1378 },
  { date: '2026.08', kospi: 3495, fwdPer: 10.2, us10Y: 4.15, usdKrw: 1382 },
  { date: '2026.09', kospi: 3520, fwdPer: 10.2, us10Y: 4.18, usdKrw: 1385, eventLabel: '현재 분석 기준' },
];

export class MarketDataService {
  static getIndices(): IndexMetric[] {
    return INITIAL_INDICES;
  }

  static getHistoricalKospi(): HistoricalPricePoint[] {
    return HISTORICAL_KOSPI_DATA;
  }

  static getFiveYearHistorical(): FiveYearMacroDataPoint[] {
    return FIVE_YEAR_HISTORICAL_DATA;
  }

  static getCurrentKospi(): number {
    return CURRENT_KOSPI_INDEX;
  }
}

