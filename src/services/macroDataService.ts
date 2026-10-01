import { InterestRateItem, FxItem, CommodityItem, MacroIndicator } from '../types/market';

export const INITIAL_RATES: InterestRateItem[] = [
  { name: '미국 국채 10년', code: 'US10Y', value: 4.18, change: -0.04, unit: '%' },
  { name: '미국 국채 2년', code: 'US2Y', value: 3.86, change: -0.02, unit: '%' },
  { name: '미국 국채 30년', code: 'US30Y', value: 4.48, change: -0.03, unit: '%' },
  { name: '한국 국고채 3년', code: 'KR3Y', value: 2.88, change: -0.01, unit: '%' },
  { name: '한국 국고채 10년', code: 'KR10Y', value: 2.98, change: -0.02, unit: '%' },
  { name: '미국 기준금리', code: 'FED', value: 4.75, change: 0.00, unit: '%' },
  { name: '한국 기준금리', code: 'BOK', value: 3.00, change: 0.00, unit: '%' },
];

export const INITIAL_FX: FxItem[] = [
  { name: '원/달러', pair: 'USD/KRW', value: 1385.50, change: -4.20, changePercent: -0.30 },
  { name: '달러인덱스', pair: 'DXY', value: 103.45, change: -0.18, changePercent: -0.17 },
  { name: '달러/엔', pair: 'USD/JPY', value: 152.30, change: 0.40, changePercent: 0.26 },
];

export const INITIAL_COMMODITIES: CommodityItem[] = [
  { name: 'WTI 원유', code: 'WTI', value: 71.40, change: -0.85, changePercent: -1.18, unit: '$/배럴' },
  { name: 'Brent 원유', code: 'BRENT', value: 75.10, change: -0.72, changePercent: -0.95, unit: '$/배럴' },
  { name: '금 (Gold)', code: 'GOLD', value: 2685.20, change: 12.40, changePercent: 0.46, unit: '$/온스' },
  { name: '구리 (Copper)', code: 'COPPER', value: 4.38, change: 0.05, changePercent: 1.15, unit: '$/파운드' },
];

export const INITIAL_MACRO_INDICATORS: MacroIndicator[] = [
  { name: '한국 수출 증가율', value: '+8.6%', unit: 'YoY', previous: '+7.4%', date: '2026.09', impactOnKospi: '긍정적' },
  { name: '한국 반도체 수출 증가율', value: '+38.4%', unit: 'YoY', previous: '+32.1%', date: '2026.09', impactOnKospi: '긍정적' },
  { name: '미국 ISM 제조업지수', value: 49.5, unit: 'pt', previous: 48.8, date: '2026.09', impactOnKospi: '중립' },
  { name: '미국 CPI (소비자물가)', value: '+2.6%', unit: 'YoY', previous: '+2.7%', date: '2026.08', impactOnKospi: '긍정적' },
  { name: '미국 Core CPI (근원)', value: '+2.9%', unit: 'YoY', previous: '+3.1%', date: '2026.08', impactOnKospi: '긍정적' },
  { name: '미국 PCE 물가지수', value: '+2.4%', unit: 'YoY', previous: '+2.5%', date: '2026.08', impactOnKospi: '긍정적' },
  { name: '미국 Core PCE (근원)', value: '+2.7%', unit: 'YoY', previous: '+2.8%', date: '2026.08', impactOnKospi: '긍정적' },
  { name: '미국 실업률', value: '4.2%', unit: '%', previous: '4.3%', date: '2026.08', impactOnKospi: '중립' },
  { name: 'CBOE VIX (변동성)', value: 15.2, unit: 'pt', previous: 16.4, date: '2026.09', impactOnKospi: '긍정적' },
];

export class MacroDataService {
  static getRates(): InterestRateItem[] {
    return INITIAL_RATES;
  }

  static getFx(): FxItem[] {
    return INITIAL_FX;
  }

  static getCommodities(): CommodityItem[] {
    return INITIAL_COMMODITIES;
  }

  static getMacro(): MacroIndicator[] {
    return INITIAL_MACRO_INDICATORS;
  }
}
