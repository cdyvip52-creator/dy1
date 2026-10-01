import {
  OutlookAssumptions,
  ScenarioDetail,
  VariableFactorEvaluation,
  AutomatedCommentary,
  SentimentLevel,
} from '../types/market';
import { LiveMarketSummary } from './marketDataService';

export const DEFAULT_ASSUMPTIONS: OutlookAssumptions = {
  expectedEps: 745, // 실시간 KOSPI(약 6,950pt) 및 선행 PER 10.5배 기준 이익성장 반영치
  epsGrowthRate: 15.0, // +15%
  bullPer: 11.5, // 강세 시나리오 적용 PER
  basePer: 10.5, // 기준 시나리오 적용 PER
  bearPer: 9.2, // 약세 시나리오 적용 PER
  us10Y: 4.18, // 미국 10년물 국채금리 (%)
  usdKrw: 1385, // 원/달러 환율
  wti: 71.4, // WTI 유가 ($/bbl)
  foreignFlow20D: 24500, // 외국인 20일 누적 순매수 (억원)
};

export class OutlookCalculator {
  /**
   * Generates default assumptions dynamically calibrated to real-time KOSPI and macro inputs
   */
  static getDefaultAssumptions(
    currentKospi: number = 6950,
    liveSummary?: LiveMarketSummary | null
  ): OutlookAssumptions {
    const impliedCurrentEps = Math.round(currentKospi / 10.5);
    const expectedEps = Math.round(impliedCurrentEps * (1 + 0.15));

    return {
      expectedEps: expectedEps > 0 ? expectedEps : 745,
      epsGrowthRate: 15.0,
      bullPer: 11.5,
      basePer: 10.5,
      bearPer: 9.2,
      us10Y: liveSummary?.macro.us10Y.current ?? 4.18,
      usdKrw: liveSummary?.macro.usdKrw.current ?? 1385,
      wti: liveSummary?.macro.wti.current ?? 71.4,
      foreignFlow20D: 24500,
    };
  }

  /**
   * Recalculates Bull, Base, and Bear scenarios in real-time
   */
  static calculateScenarios(
    currentKospi: number,
    assumptions: OutlookAssumptions
  ): {
    bull: ScenarioDetail;
    base: ScenarioDetail;
    bear: ScenarioDetail;
  } {
    // 강세: 이익 상향 서프라이즈(EPS +5%) + 강세 PER(11.5배) 적용
    const bullEps = Math.round(assumptions.expectedEps * 1.05);
    const bullTarget = Math.round(bullEps * assumptions.bullPer);
    const bullReturn = Number((((bullTarget - currentKospi) / currentKospi) * 100).toFixed(1));

    // 기준: 설정된 12M Fwd EPS + 기준 PER(10.5배) 적용
    const baseEps = assumptions.expectedEps;
    const baseTarget = Math.round(baseEps * assumptions.basePer);
    const baseReturn = Number((((baseTarget - currentKospi) / currentKospi) * 100).toFixed(1));

    // 약세: 실적 컨센서스 하향(EPS -6%) + 디레이팅(약세 PER 9.2배) 적용
    const bearEps = Math.round(assumptions.expectedEps * 0.94);
    const bearTarget = Math.round(bearEps * assumptions.bearPer);
    const bearReturn = Number((((bearTarget - currentKospi) / currentKospi) * 100).toFixed(1));

    return {
      bull: {
        name: '강세 시나리오 (Bull)',
        type: 'bull',
        targetKospi: bullTarget,
        expectedEps: bullEps,
        appliedPer: assumptions.bullPer,
        returnPercent: bullReturn,
        conditions: [
          '글로벌 AI 및 고대역폭메모리(HBM) 수요 확대로 반도체 영업이익 전망치 추가 상향',
          '미국 연준(Fed)의 완만한 금리 인하 사이클로 미국 10년물 국채금리 4.0% 이하 안착',
          '원/달러 환율 1,350원대 안정화에 따른 외국인 패시브 및 액티브 자금 연속 순유입',
          '국내 밸류업 프로그램 및 주주환원율 확대에 따른 코리아 디스카운트 축소 (PER 리레이팅)',
        ],
        keyRisks: [
          '반도체 공급 과잉 논란 재점화 및 빅테크 설비투자(Capex) 축소 가능성',
          '지정학적 갈등에 따른 국제유가 반등 및 인플레이션 경직성',
        ],
      },
      base: {
        name: '기준 시나리오 (Base)',
        type: 'base',
        targetKospi: baseTarget,
        expectedEps: baseEps,
        appliedPer: assumptions.basePer,
        returnPercent: baseReturn,
        conditions: [
          '현 추세 수준의 KOSPI 연간 순이익 달성 및 삼성전자·SK하이닉스 실적 안정',
          '미국 국채 10년물 4.10%~4.30% 박스권 등락 및 미 연준의 점진적 정책 조정',
          '원/달러 환율 1,360~1,400원 레인지 지속 속 완만한 외국인 순매수 기조 유지',
          'KOSPI 12개월 선행 PER 역사적 5년 평균 수준(10.5배 내외) 유지',
        ],
        keyRisks: [
          '환율 변동성 확대 및 수출 증가세 둔화 시 실적 피크아웃 우려',
          '주요 교역국(미·중) 경기 둔화 리스크',
        ],
      },
      bear: {
        name: '약세 시나리오 (Bear)',
        type: 'bear',
        targetKospi: bearTarget,
        expectedEps: bearEps,
        appliedPer: assumptions.bearPer,
        returnPercent: bearReturn,
        conditions: [
          'AI 반도체 수요 피크아웃 논란 및 일반 메모리 회복 지연으로 기업이익 컨센서스 하향 조정',
          '미국 인플레이션 반등으로 국채금리 4.5% 재돌파 및 긴축 장기화 우려',
          '원/달러 환율 1,420원 상회 시 외국인 대규모 차익 실현 및 자금 유출',
          '지정학적 리스크 심화로 위험자산 회피 및 KOSPI 밸류에이션 9.2배 수준 하향(디레이팅)',
        ],
        keyRisks: [
          '글로벌 보호무역 기조 강화 및 수출 기업 마진 압박',
          '고금리 장기화에 따른 내수 회복 지연 및 한계기업 부실화',
        ],
      },
    };
  }

  /**
   * Dynamically evaluates 8 macro factors based on real-time inputs & live market quotes
   */
  static evaluateFactors(
    assumptions: OutlookAssumptions,
    currentKospi: number = 6950,
    liveSummary?: LiveMarketSummary | null
  ): VariableFactorEvaluation[] {
    // 1. 기업이익 (EPS 성장률 및 내재 가치 기준 평가)
    let epsScore: SentimentLevel = 'neutral';
    let epsLabel = '중립';
    let epsSummary = '전년 대비 견조한 이익 모멘텀';

    const impliedCurrentEps = currentKospi > 0 ? Math.round(currentKospi / assumptions.basePer) : 662;
    const isEpsAboveTrend = assumptions.expectedEps >= impliedCurrentEps * 1.1;

    if (assumptions.epsGrowthRate >= 18 || isEpsAboveTrend) {
      epsScore = 'very_bullish';
      epsLabel = '매우 긍정적';
      epsSummary = '두 자릿수 이익 성장 및 반도체 턴어라운드 가속';
    } else if (assumptions.epsGrowthRate >= 10) {
      epsScore = 'bullish';
      epsLabel = '긍정적';
      epsSummary = '실적 개선 추세 유지 및 수출 제조업 실적 방어';
    } else if (assumptions.epsGrowthRate < 0) {
      epsScore = 'very_bearish';
      epsLabel = '매우 부정적';
      epsSummary = '기업이익 역성장 및 실적 추정치 하향 압력';
    } else if (assumptions.epsGrowthRate < 6) {
      epsScore = 'bearish';
      epsLabel = '부정적';
      epsSummary = '이익 추정치 둔화 우려';
    }

    // 2. 반도체 업황 (실시간 SOX 및 삼성/하이닉스 시세 연동)
    let semiScore: SentimentLevel = 'bullish';
    let semiLabel = '긍정적';
    let semiSummary = 'AI 서버향 HBM 및 고부가 메모리 판가 견조';
    let semiDetail = 'HBM3E/HBM4 공급 주도권 및 D램 고정거래가격 상승세 지지';

    if (liveSummary) {
      const sox = liveSummary.indices.find((i) => i.id === 'sox');
      const sk = liveSummary.stocks.find((s) => s.ticker === '000660');
      if (sox && sox.changePercent > 1.5) {
        semiScore = 'very_bullish';
        semiLabel = '매우 긍정적';
        semiSummary = `필라델피아 반도체(+${sox.changePercent}%) 및 AI 가속기 모멘텀 급등`;
        semiDetail = `실시간 필라델피아 반도체 지수 강세 연동. SK하이닉스(${sk?.current.toLocaleString()}원) 수혜`;
      }
    }

    // 3. 금리 (실시간 미국 10년물 기준)
    let rateScore: SentimentLevel = 'neutral';
    let rateLabel = '중립';
    let rateSummary = '미국 10년물 4.1%~4.3% 레인지 등락';
    if (assumptions.us10Y < 4.0) {
      rateScore = 'bullish';
      rateLabel = '긍정적';
      rateSummary = '금리 하향 안정세로 밸류에이션 부담 완화';
    } else if (assumptions.us10Y >= 4.45) {
      rateScore = 'very_bearish';
      rateLabel = '매우 부정적';
      rateSummary = '미 10년물 4.45% 상회, 할인율 상승 압박';
    } else if (assumptions.us10Y >= 4.30) {
      rateScore = 'bearish';
      rateLabel = '부정적';
      rateSummary = '국채금리 반등 경계감 지속';
    }

    // 4. 환율 (USD/KRW)
    let fxScore: SentimentLevel = 'neutral';
    let fxLabel = '중립';
    let fxSummary = '1,370~1,390원 수준의 고환율 레인지';
    if (assumptions.usdKrw <= 1340) {
      fxScore = 'bullish';
      fxLabel = '긍정적';
      fxSummary = '원화 강세 전환으로 외국인 환차익 매수 유인 확대';
    } else if (assumptions.usdKrw >= 1420) {
      fxScore = 'very_bearish';
      fxLabel = '매우 부정적';
      fxSummary = '1,420원 돌파, 환율 급등에 따른 외인 이탈 위험';
    } else if (assumptions.usdKrw >= 1395) {
      fxScore = 'bearish';
      fxLabel = '부정적';
      fxSummary = '환율 상방 압력으로 수급 불안 요인';
    }

    // 5. 외국인 수급 (20일 누적)
    let flowScore: SentimentLevel = 'neutral';
    let flowLabel = '중립';
    let flowSummary = '외국인 순매수 관망세';
    if (assumptions.foreignFlow20D >= 40000) {
      flowScore = 'very_bullish';
      flowLabel = '매우 긍정적';
      flowSummary = '대형 IT 중심 강력한 외국인 패시브 매수세';
    } else if (assumptions.foreignFlow20D >= 20000) {
      flowScore = 'bullish';
      flowLabel = '긍정적';
      flowSummary = '최근 20일간 2조원 이상 지속 순매수 유입';
    } else if (assumptions.foreignFlow20D <= -20000) {
      flowScore = 'very_bearish';
      flowLabel = '매우 부정적';
      flowSummary = '외국인 대규모 연속 순매도 출회';
    } else if (assumptions.foreignFlow20D < 0) {
      flowScore = 'bearish';
      flowLabel = '부정적';
      flowSummary = '외국인 순매도 전환 흐름 포착';
    }

    // 6. 경기 (수출 및 제조업)
    const macroScore: SentimentLevel = 'bullish';
    const macroLabel = '긍정적';
    const macroSummary = '한국 대미/대아세안 IT 수출 두 자릿수 증가세 유지';

    // 7. 밸류에이션 (현재 기준 PER vs 역사적 평균)
    let valScore: SentimentLevel = 'bullish';
    let valLabel = '긍정적';
    let valSummary = `적용 PER ${assumptions.basePer}배로 5년 평균(10.8배) 대비 매력`;
    if (assumptions.basePer > 11.5) {
      valScore = 'bearish';
      valLabel = '부정적';
      valSummary = '역사적 상단 밸류에이션 진입으로 추가 확장 여력 제한';
    } else if (assumptions.basePer < 9.5) {
      valScore = 'very_bullish';
      valLabel = '매우 긍정적';
      valSummary = '극심한 저평가 구간으로 하방 경직성 확보';
    }

    // 8. 글로벌 위험선호 (VIX 및 글로벌 증시)
    let riskScore: SentimentLevel = 'bullish';
    let riskLabel = '긍정적';
    let riskSummary = '글로벌 유동성 및 미국 증시 사상 최고치권 유지';
    if (liveSummary) {
      const sp500 = liveSummary.indices.find((i) => i.id === 'sp500');
      if (sp500 && sp500.changePercent < -1.0) {
        riskScore = 'bearish';
        riskLabel = '부정적';
        riskSummary = `S&P 500(${sp500.changePercent}%) 단기 조정으로 위험회피 심리 부각`;
      }
    }

    return [
      {
        id: 'earnings',
        name: '기업이익 (EPS)',
        score: epsScore,
        scoreLabel: epsLabel,
        summary: epsSummary,
        detail: `KOSPI 예상 12M Fwd EPS ${assumptions.expectedEps.toLocaleString()}원 (연간 성장률 ${assumptions.epsGrowthRate}% 전제)`,
        impactWeight: '높음',
      },
      {
        id: 'semiconductor',
        name: '반도체 업황',
        score: semiScore,
        scoreLabel: semiLabel,
        summary: semiSummary,
        detail: semiDetail,
        impactWeight: '높음',
      },
      {
        id: 'interest_rate',
        name: '금리 환경',
        score: rateScore,
        scoreLabel: rateLabel,
        summary: rateSummary,
        detail: `미국 10년물 ${assumptions.us10Y}% 기준. 주식 밸류에이션 할인율에 직접 작용`,
        impactWeight: '높음',
      },
      {
        id: 'foreign_exchange',
        name: '환율 (USD/KRW)',
        score: fxScore,
        scoreLabel: fxLabel,
        summary: fxSummary,
        detail: `원/달러 ${assumptions.usdKrw.toLocaleString()}원. 외국인 환차손익 및 수출 채산성에 영향`,
        impactWeight: '중간',
      },
      {
        id: 'foreign_flow',
        name: '외국인 수급',
        score: flowScore,
        scoreLabel: flowLabel,
        summary: flowSummary,
        detail: `최근 20거래일 외국인 누적 순매수 ${Math.round((assumptions.foreignFlow20D / 10000) * 10) / 10}조원 규모`,
        impactWeight: '높음',
      },
      {
        id: 'macro_economy',
        name: '경기 및 수출',
        score: macroScore,
        scoreLabel: macroLabel,
        summary: macroSummary,
        detail: '통관 기준 월간 수출 호조세와 무역수지 흑자 기조 유지',
        impactWeight: '중간',
      },
      {
        id: 'valuation',
        name: '밸류에이션 레벨',
        score: valScore,
        scoreLabel: valLabel,
        summary: valSummary,
        detail: `적용 PER ${assumptions.basePer}배 기준. 5년 평균 10.8배 대비 상대적 매력`,
        impactWeight: '높음',
      },
      {
        id: 'risk_appetite',
        name: '글로벌 위험선호',
        score: riskScore,
        scoreLabel: riskLabel,
        summary: riskSummary,
        detail: '글로벌 증시 및 기술주 랠리 모멘텀 연동',
        impactWeight: '보통',
      },
    ];
  }

  /**
   * Generates dynamic commentary quoting live price levels and scenario spread
   */
  static generateCommentary(
    currentKospi: number,
    assumptions: OutlookAssumptions,
    scenarios: { bull: ScenarioDetail; base: ScenarioDetail; bear: ScenarioDetail },
    liveSummary?: LiveMarketSummary | null
  ): AutomatedCommentary {
    const isRateHigh = assumptions.us10Y >= 4.3;
    const isFxHigh = assumptions.usdKrw >= 1395;

    const baseReturnStr = `${scenarios.base.returnPercent >= 0 ? '+' : ''}${scenarios.base.returnPercent}%`;
    const bullReturnStr = `${scenarios.bull.returnPercent >= 0 ? '+' : ''}${scenarios.bull.returnPercent}%`;
    const bearReturnStr = `${scenarios.bear.returnPercent >= 0 ? '+' : ''}${scenarios.bear.returnPercent}%`;

    // 1. 종합 판단 (3~5 sentences)
    const overallJudgement = [
      `향후 6개월 KOSPI는 반도체 주도 기업이익 개선세가 지속되는 가운데, 미국 금리 및 환율 안정화에 따라 밸류에이션(PER) 상단이 결정되는 국면으로 판단된다.`,
      `현재 실시간 KOSPI 지수(${currentKospi.toLocaleString()}pt)는 12M Fwd EPS ${assumptions.expectedEps.toLocaleString()}원 및 기준 PER ${assumptions.basePer}배 적용 시 6개월 목표치 ${scenarios.base.targetKospi.toLocaleString()}pt (${baseReturnStr})의 경로를 형성한다.`,
      isRateHigh
        ? `미국 10년물 국채금리가 ${assumptions.us10Y}%로 상방 경직성을 보이고 있어, 단기적으로 밸류에이션 급등보다는 실적 가시성에 기반한 펀더멘털 장세가 유력하다.`
        : `미국 10년물 금리가 ${assumptions.us10Y}% 수준에서 안정세를 보여 주식시장 할인율 부담이 경감되는 우호적 여건이 조성되어 있다.`,
      isFxHigh
        ? `원/달러 환율이 ${assumptions.usdKrw.toLocaleString()}원대로 높은 수준에 머물러 있는 점은 외국인 수급 변동성을 확대시키는 요인이다.`
        : `외국인 수급은 환율 안정과 함께 대형 반도체 종목을 중심으로 순유입세를 유지하며 지수 하방을 지지하고 있다.`,
      `실시간 시나리오 범위는 약세 ${scenarios.bear.targetKospi.toLocaleString()}pt(${bearReturnStr})에서 강세 ${scenarios.bull.targetKospi.toLocaleString()}pt(${bullReturnStr})로 산출되며, 핵심 주도주 중심의 선별적 포트폴리오 대응이 권고된다.`,
    ];

    // 2. 핵심 상승 요인
    const bullFactors = [
      `삼성전자·SK하이닉스 중심의 AI 메모리(HBM) 수요 폭증 및 영업이익 고성장 기조`,
      `KOSPI 적용 PER ${assumptions.basePer}배 수준으로 역사적 5년 평균(10.8배) 대비 밸류에이션 매력 유지`,
      `한국 월간 반도체 및 자동차 중심의 견조한 수출 흑자 사이클 지속`,
      `기업 밸류업 프로그램 안착에 따른 배당 확대 및 자사주 소각 등 주주환원율 제고`,
      `미국 연준(Fed)의 통화정책 전환에 따른 글로벌 유동성 환경 개선 기대`,
    ];

    // 3. 핵심 하락 요인
    const bearFactors = [
      `미국 국채 10년물 금리(${assumptions.us10Y}%)의 상방 경직성 및 인플레이션 재점화 위험`,
      `원/달러 환율(${assumptions.usdKrw.toLocaleString()}원) 고환율 장기화로 인한 외국인 환차손 회피 매물 출회 가능성`,
      `국제 유가($${assumptions.wti}/배럴) 및 지정학적 리스크에 따른 원가 부담`,
      `글로벌 빅테크 AI 설비투자(Capex) 피크아웃 논란 및 일반 IT 기기 수요 회복 지연`,
      `보호무역주의 및 관세 정책 강화에 따른 대외 수출 의존도 높은 국내 제조업 마진 압박`,
    ];

    // 4. 핵심 체크포인트
    const keyCheckpoints = [
      `미국 연준 FOMC의 점도표와 미국 10년물 국채금리 4.0% 하향 돌파 여부`,
      `글로벌 빅테크(MS·구글·메타·아마존)의 분기별 AI 데이터센터 설비투자(Capex) 유지 여부`,
      `원/달러 환율의 1,350원선 안착 여부 및 외국인 선물 순매수 전환 탄력성`,
      `분기별 실적 시즌 삼성전자 및 SK하이닉스의 HBM 공급 단가와 비메모리 턴어라운드 시점`,
      `글로벌 주요 교역국의 경기 선행지표 및 한국 반도체 수출 증가율 유지 여부`,
    ];

    // 5. 핵심 질문 답변
    const primaryDriverAnswer = `향후 6개월 KOSPI의 방향을 결정할 가장 결정적인 변수는 '삼성전자·SK하이닉스를 필두로 한 반도체 이익 추정치의 추가 상향 여부(EPS 모멘텀)'와 '미국 10년물 국채금리 안정에 기반한 멀티플(PER) 방어력'의 결합이다. 실적 추정치가 훼손되지 않는 한 KOSPI의 하방은 약세 목표치인 ${scenarios.bear.targetKospi.toLocaleString()}pt 선에서 강력히 지지될 것이나, 강세 목표치인 ${scenarios.bull.targetKospi.toLocaleString()}pt 이상 돌파를 위해서는 금리 하락과 환율 안정에 따른 PER 멀티플 확장이 필수적이다.`;

    return {
      overallJudgement,
      bullFactors,
      bearFactors,
      keyCheckpoints,
      primaryDriverAnswer,
    };
  }
}
