import { ValuationState } from '../types/market';

export const INITIAL_VALUATION_STATE: ValuationState = {
  fwdPer: 10.20, // 3,520 / 345 ≈ 10.20배
  trailingPer: 11.45,
  pbr: 0.98,
  roe: 9.85,
  dividendYield: 2.15,
  fiveYearAvgPer: 10.80,
  tenYearAvgPer: 10.50,
  perLevel: '평균 이하',
  updatedAt: '2026.09.30',
};

export class ValuationService {
  static getValuation(): ValuationState {
    return INITIAL_VALUATION_STATE;
  }

  static evaluatePerLevel(currentPer: number, fiveYearAvg: number = 10.80): '낮음' | '평균 이하' | '평균' | '평균 이상' | '높음' {
    const diffPercent = ((currentPer - fiveYearAvg) / fiveYearAvg) * 100;
    if (diffPercent < -15) return '낮음';
    if (diffPercent < -5) return '평균 이하';
    if (diffPercent <= 5) return '평균';
    if (diffPercent <= 15) return '평균 이상';
    return '높음';
  }
}
