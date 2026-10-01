export type SentimentLevel = 'very_bearish' | 'bearish' | 'neutral' | 'bullish' | 'very_bullish';

export interface IndexMetric {
  id: string;
  name: string;
  symbol: string;
  current: number;
  change: number;
  changePercent: number;
  change1W: number;
  change1M: number;
  change3M: number;
  unit?: string;
  updatedAt: string;
}

export interface HistoricalPricePoint {
  date: string;
  close: number;
  label?: string;
}

export interface FiveYearMacroDataPoint {
  date: string; // 'YYYY.MM'
  kospi: number;
  fwdPer: number;
  us10Y: number;
  usdKrw: number;
  eventLabel?: string;
}

export interface CompanyEarningsProjection {
  name: string;
  ticker: string;
  currentYearOpProfit: number; // 억원
  nextYearOpProfit: number;
  opProfitGrowth: number; // %
  fwdEps: number; // 원
  epsGrowth: number; // %
  fwdPer: number; // 배
  shareOfKospiEarnings: number; // %
}

export interface EarningsState {
  kospi12MFwdEps: number; // 원
  currentYearEps: number;
  nextYearEps: number;
  epsGrowthRate: number; // %
  totalOperatingProfit: number; // 조원
  totalNetProfit: number; // 조원
  companies: CompanyEarningsProjection[];
  updatedAt: string;
}

export interface ValuationState {
  fwdPer: number;
  trailingPer: number;
  pbr: number;
  roe: number;
  dividendYield: number;
  fiveYearAvgPer: number;
  tenYearAvgPer: number;
  perLevel: '낮음' | '평균 이하' | '평균' | '평균 이상' | '높음';
  updatedAt: string;
}

export interface InterestRateItem {
  name: string;
  code: string;
  value: number;
  change: number; // %p
  unit: string;
}

export interface FxItem {
  name: string;
  pair: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface CommodityItem {
  name: string;
  code: string;
  value: number;
  change: number;
  changePercent: number;
  unit: string;
}

export interface FlowMetric {
  category: '외국인' | '기관' | '개인';
  net1D: number; // 억원
  net5D: number;
  net20D: number;
  net60D: number;
}

export interface MacroIndicator {
  name: string;
  value: string | number;
  unit: string;
  previous: string | number;
  date: string;
  impactOnKospi: '긍정적' | '중립' | '부정적';
}

export interface VariableFactorEvaluation {
  id: string;
  name: string;
  score: SentimentLevel;
  scoreLabel: string;
  summary: string;
  detail: string;
  impactWeight: '높음' | '중간' | '보통';
}

export interface OutlookAssumptions {
  expectedEps: number; // 예상 EPS (원)
  epsGrowthRate: number; // 예상 EPS 성장률 (%)
  bullPer: number; // 강세 적용 PER
  basePer: number; // 기준 적용 PER
  bearPer: number; // 약세 적용 PER
  us10Y: number; // 미국 10년물 금리 (%)
  usdKrw: number; // 원/달러 환율
  wti: number; // WTI 유가 ($)
  foreignFlow20D: number; // 외국인 20일 순매수 (억원)
}

export interface ScenarioDetail {
  name: string;
  type: 'bull' | 'base' | 'bear';
  targetKospi: number;
  expectedEps: number;
  appliedPer: number;
  returnPercent: number;
  conditions: string[];
  keyRisks: string[];
}

export interface AutomatedCommentary {
  overallJudgement: string[];
  bullFactors: string[];
  bearFactors: string[];
  keyCheckpoints: string[];
  primaryDriverAnswer: string;
}

export interface SavedOutlook {
  id: string;
  title: string;
  createdAt: string;
  author: string;
  currentKospi: number;
  bullTarget: number;
  baseTarget: number;
  bearTarget: number;
  assumptions: OutlookAssumptions;
  commentary: AutomatedCommentary;
  isVerified?: boolean;
  actualOutcome?: {
    verifiedDate: string;
    actualKospi: number;
    actualEps: number;
    actualPer: number;
    errorPoints: number;
    errorPercent: number;
    postMortemNotes: string;
  };
}
