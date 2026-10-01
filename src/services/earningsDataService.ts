import { EarningsState } from '../types/market';

export const INITIAL_EARNINGS_STATE: EarningsState = {
  kospi12MFwdEps: 345, // 12M Fwd EPS (포인트 환산치 또는 주당순이익 환산치)
  currentYearEps: 320,
  nextYearEps: 368,
  epsGrowthRate: 15.0, // 전년대비 +15.0%
  totalOperatingProfit: 278.5, // 조원
  totalNetProfit: 215.2, // 조원
  companies: [
    {
      name: '삼성전자',
      ticker: '005930',
      currentYearOpProfit: 465000, // 46조 5천억원
      nextYearOpProfit: 540000, // 54조원
      opProfitGrowth: 16.1,
      fwdEps: 6850,
      epsGrowth: 18.2,
      fwdPer: 11.2,
      shareOfKospiEarnings: 21.5,
    },
    {
      name: 'SK하이닉스',
      ticker: '000660',
      currentYearOpProfit: 242000, // 24조 2천억원
      nextYearOpProfit: 308000, // 30조 8천억원
      opProfitGrowth: 27.3,
      fwdEps: 24500,
      epsGrowth: 31.4,
      fwdPer: 8.6,
      shareOfKospiEarnings: 12.8,
    },
    {
      name: '현대차',
      ticker: '005380',
      currentYearOpProfit: 154000,
      nextYearOpProfit: 162000,
      opProfitGrowth: 5.2,
      fwdEps: 42000,
      epsGrowth: 4.8,
      fwdPer: 5.4,
      shareOfKospiEarnings: 6.2,
    },
  ],
  updatedAt: '2026.09.30',
};

export class EarningsDataService {
  static getEarnings(): EarningsState {
    return INITIAL_EARNINGS_STATE;
  }
}
