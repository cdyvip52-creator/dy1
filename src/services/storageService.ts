import { SavedOutlook, OutlookAssumptions, AutomatedCommentary } from '../types/market';

const STORAGE_KEY = 'kospi_outlook_records_v1';

// Pre-seeded records for testing verification right away
const SEED_OUTLOOKS: SavedOutlook[] = [
  {
    id: 'rec-20260401-01',
    title: '2026년 2분기 KOSPI 6개월 전략 전망',
    createdAt: '2026.04.01',
    author: '퀀트리서치팀',
    currentKospi: 3200,
    bullTarget: 3800,
    baseTarget: 3550,
    bearTarget: 2950,
    assumptions: {
      expectedEps: 335,
      epsGrowthRate: 12.0,
      bullPer: 11.2,
      basePer: 10.6,
      bearPer: 9.2,
      us10Y: 4.35,
      usdKrw: 1375,
      wti: 78.5,
      foreignFlow20D: 18000,
    },
    commentary: {
      overallJudgement: [
        '상반기 IT 수출 회복세를 바탕으로 연말 3,550pt 달성을 기대함.',
        '금리 하향 안정 시 밸류에이션 정상화가 견인할 것으로 분석.',
      ],
      bullFactors: ['반도체 수출 호조', '외국인 순매수 지속'],
      bearFactors: ['미국 고금리 장기화', '유가 변동성'],
      keyCheckpoints: ['미국 연준 금리 인하 시점', 'HBM3E 양산 일정'],
      primaryDriverAnswer: '반도체 실적 개선과 국채금리 안정화의 동반 출현 여부',
    },
    isVerified: true,
    actualOutcome: {
      verifiedDate: '2026.09.30',
      actualKospi: 3480,
      actualEps: 340,
      actualPer: 10.23,
      errorPoints: -70,
      errorPercent: -1.97,
      postMortemNotes:
        '실제 EPS(340원)는 예상 EPS(335원)에 근접하여 이익 추정은 매우 우수했으나, 실제 PER(10.23배)이 가정했던 기준 PER(10.6배)보다 낮게 형성되어 목표치 대비 약 70pt(-1.97%)의 근소한 괴리가 발생함. 전체적으로 높은 신뢰도의 전망으로 평가됨.',
    },
  },
  {
    id: 'rec-20251001-01',
    title: '2025년 4분기 KOSPI 6개월 전략 전망',
    createdAt: '2025.10.01',
    author: '글로벌전략팀',
    currentKospi: 3120,
    bullTarget: 3600,
    baseTarget: 3400,
    bearTarget: 2850,
    assumptions: {
      expectedEps: 325,
      epsGrowthRate: 10.5,
      bullPer: 11.0,
      basePer: 10.5,
      bearPer: 9.0,
      us10Y: 4.10,
      usdKrw: 1355,
      wti: 75.0,
      foreignFlow20D: 21000,
    },
    commentary: {
      overallJudgement: [
        'HBM 반도체 실적 견인에 힘입어 2026년 상반기 3,400pt 레벨 도달 예상.',
      ],
      bullFactors: ['반도체 수출 성장 가속', '외국인 순매수 지속'],
      bearFactors: ['미국 금리 불확실성'],
      keyCheckpoints: ['글로벌 IT Capex', '원/달러 환율 안정'],
      primaryDriverAnswer: '반도체 실적 개선 추세의 지속성',
    },
    isVerified: true,
    actualOutcome: {
      verifiedDate: '2026.04.01',
      actualKospi: 3385,
      actualEps: 330,
      actualPer: 10.26,
      errorPoints: -15,
      errorPercent: -0.44,
      postMortemNotes:
        '당시 기준 목표치 3,400pt 대비 실제 3,385pt(-15pt, -0.44%)로 매우 정밀한 예측 정확도를 보임. 실현 EPS(330원)와 실현 PER(10.26배) 모두 예상 범위 내에서 안착함.',
    },
  },
  {
    id: 'rec-20260715-02',
    title: '2026 하반기 실적 랠리 시나리오 점검',
    createdAt: '2026.07.15',
    author: '투자전략 파트',
    currentKospi: 3450,
    bullTarget: 4050,
    baseTarget: 3720,
    bearTarget: 3150,
    assumptions: {
      expectedEps: 348,
      epsGrowthRate: 14.5,
      bullPer: 11.4,
      basePer: 10.7,
      bearPer: 9.4,
      us10Y: 4.22,
      usdKrw: 1380,
      wti: 74.0,
      foreignFlow20D: 22000,
    },
    commentary: {
      overallJudgement: [
        '실적 모멘텀이 강화되며 3,700pt 레벨 돌파 시도 예상.',
      ],
      bullFactors: ['영업이익 추정치 상향', '원화 점진적 안정'],
      bearFactors: ['미국 대선 정책 불확실성'],
      keyCheckpoints: ['빅테크 AI 투자 지속성'],
      primaryDriverAnswer: '미국 10년물 금리의 4.2% 하향 안착 여부',
    },
    isVerified: false,
  },
];

export class StorageService {
  static getOutlooks(): SavedOutlook[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_OUTLOOKS));
        return SEED_OUTLOOKS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_OUTLOOKS;
    }
  }

  static saveOutlook(
    title: string,
    currentKospi: number,
    assumptions: OutlookAssumptions,
    scenarios: { bull: { targetKospi: number }; base: { targetKospi: number }; bear: { targetKospi: number } },
    commentary: AutomatedCommentary,
    author: string = '리서치 애널리스트'
  ): SavedOutlook {
    const outlooks = this.getOutlooks();
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    const newRecord: SavedOutlook = {
      id: `rec-${Date.now()}`,
      title: title.trim() || `${dateStr} KOSPI 6개월 전망`,
      createdAt: dateStr,
      author,
      currentKospi,
      bullTarget: scenarios.bull.targetKospi,
      baseTarget: scenarios.base.targetKospi,
      bearTarget: scenarios.bear.targetKospi,
      assumptions: { ...assumptions },
      commentary: { ...commentary },
      isVerified: false,
    };

    const updated = [newRecord, ...outlooks];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRecord;
  }

  static verifyOutlook(
    id: string,
    actualKospi: number,
    actualEps: number,
    actualPer: number,
    customNotes?: string
  ): SavedOutlook[] {
    const outlooks = this.getOutlooks();
    const updated = outlooks.map((item) => {
      if (item.id === id) {
        const errorPoints = actualKospi - item.baseTarget;
        const errorPercent = Number(((errorPoints / item.baseTarget) * 100).toFixed(2));
        
        let notes = customNotes;
        if (!notes) {
          const epsDiff = actualEps - item.assumptions.expectedEps;
          const perDiff = actualPer - item.assumptions.basePer;
          const epsAccurate = Math.abs(epsDiff / item.assumptions.expectedEps) < 0.05;
          const perHigher = perDiff < -0.3;
          
          if (epsAccurate && perHigher) {
            notes = `EPS 전망(예상 ${item.assumptions.expectedEps}원 vs 실제 ${actualEps}원)은 매우 정확했으나, PER 가정(예상 ${item.assumptions.basePer}배 vs 실제 ${actualPer.toFixed(2)}배)이 다소 높아 목표치 대비 ${errorPoints}pt (${errorPercent}%)의 오차가 발생했습니다.`;
          } else {
            notes = `실제 KOSPI ${actualKospi}pt 기록으로 당시 기준 전망(${item.baseTarget}pt) 대비 ${errorPoints >= 0 ? '+' : ''}${errorPoints}pt (${errorPercent}%) 오차를 나타냈습니다.`;
          }
        }

        const today = new Date();
        const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

        return {
          ...item,
          isVerified: true,
          actualOutcome: {
            verifiedDate: dateStr,
            actualKospi,
            actualEps,
            actualPer,
            errorPoints,
            errorPercent,
            postMortemNotes: notes,
          },
        };
      }
      return item;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  static deleteOutlook(id: string): SavedOutlook[] {
    const outlooks = this.getOutlooks();
    const updated = outlooks.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
}
