import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { OutlookAssumptions } from '../types/market';
import { FlowDataService } from '../services/flowDataService';

interface MarketVariableCardsProps {
  assumptions: OutlookAssumptions;
  currentPer: number;
}

interface VariableCardItem {
  id: string;
  name: string;
  category: string;
  value: string;
  change: string;
  direction: 'up' | 'down' | 'flat';
  impact: '긍정적' | '중립' | '부정적';
  description: string;
}

export const MarketVariableCards: React.FC<MarketVariableCardsProps> = ({
  assumptions,
  currentPer,
}) => {
  // Derive items based on assumptions and latest quotes
  const foreignFlowFormatted = FlowDataService.formatMoney(assumptions.foreignFlow20D);

  const cards: VariableCardItem[] = [
    {
      id: 'fwd_eps',
      name: 'KOSPI Forward EPS',
      category: '기업이익',
      value: `${assumptions.expectedEps.toLocaleString()}원`,
      change: `+${assumptions.epsGrowthRate}% (YoY)`,
      direction: 'up',
      impact: assumptions.expectedEps >= 340 ? '긍정적' : '중립',
      description: '반도체 실적 견인 및 12개월 선행',
    },
    {
      id: 'fwd_per',
      name: 'KOSPI Forward PER',
      category: '밸류에이션',
      value: `${currentPer.toFixed(2)}배`,
      change: '-0.15배 (5년평균 10.8배)',
      direction: 'down',
      impact: currentPer <= 10.8 ? '긍정적' : '부정적',
      description: '역사적 밸류에이션 밴드 하단권',
    },
    {
      id: 'us_10y',
      name: '미국 10년물 국채금리',
      category: '글로벌 금리',
      value: `${assumptions.us10Y.toFixed(2)}%`,
      change: '↑ 0.04%p (주간)',
      direction: 'up',
      impact: assumptions.us10Y > 4.25 ? '부정적' : '중립',
      description: '글로벌 밸류에이션 할인율 핵심',
    },
    {
      id: 'usd_krw',
      name: '원/달러 환율 (USD/KRW)',
      category: '환율',
      value: `${assumptions.usdKrw.toLocaleString()}원`,
      change: '↓ 4.20원 (전일비)',
      direction: 'down',
      impact: assumptions.usdKrw >= 1400 ? '부정적' : assumptions.usdKrw <= 1360 ? '긍정적' : '중립',
      description: '외국인 수급 및 환차손익 직결',
    },
    {
      id: 'wti_oil',
      name: 'WTI 원유',
      category: '원자재',
      value: `$${assumptions.wti.toFixed(2)}`,
      change: '↓ $0.85 (-1.18%)',
      direction: 'down',
      impact: assumptions.wti < 80 ? '긍정적' : '부정적',
      description: '제조업 원가 부담 완화 영역',
    },
    {
      id: 'foreign_flow_20d',
      name: '외국인 20일 순매수',
      category: '시장 수급',
      value: foreignFlowFormatted,
      change: '+1.2조원 (최근 5일)',
      direction: assumptions.foreignFlow20D >= 0 ? 'up' : 'down',
      impact: assumptions.foreignFlow20D > 10000 ? '긍정적' : assumptions.foreignFlow20D < -5000 ? '부정적' : '중립',
      description: '반도체·대형 IT 중심 순유입',
    },
    {
      id: 'vix_index',
      name: 'CBOE VIX (변동성)',
      category: '위험 선호',
      value: '15.20 pt',
      change: '↓ 1.20 pt (-7.3%)',
      direction: 'down',
      impact: '긍정적',
      description: '시장 위험 회피 심리 안정권',
    },
    {
      id: 'semiconductor_cycle',
      name: '반도체 업황',
      category: '핵심 섹터',
      value: '상승 사이클',
      change: '+38.4% (수출 YoY)',
      direction: 'up',
      impact: '긍정적',
      description: 'HBM 고마진 및 메모리 판가 상승',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span>시장 핵심 변수 모니터 (8대 지표)</span>
          <span className="text-[11px] font-normal text-slate-400">· KOSPI 지수 영향도 평가</span>
        </h2>
        <span className="text-xs text-slate-500">최근 업데이트: 2026.09.30</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {cards.map((card) => {
          let impactBg = 'bg-slate-100 text-slate-700 border-slate-200';
          if (card.impact === '긍정적') {
            impactBg = 'bg-red-50 text-red-800 border-red-200 font-bold';
          } else if (card.impact === '부정적') {
            impactBg = 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
          }

          return (
            <div
              key={card.id}
              className="bg-white rounded-lg border border-slate-200/80 p-3.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{card.category}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${impactBg}`}>
                    {card.impact}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700 truncate" title={card.name}>
                  {card.name}
                </div>
                <div className="text-lg font-bold text-slate-900 mt-1 font-tabular">
                  {card.value}
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-500 font-tabular truncate">
                  {card.direction === 'up' && <ArrowUp className="w-3 h-3 text-red-600 shrink-0" />}
                  {card.direction === 'down' && <ArrowDown className="w-3 h-3 text-blue-600 shrink-0" />}
                  {card.direction === 'flat' && <Minus className="w-3 h-3 text-slate-400 shrink-0" />}
                  <span className="truncate">{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
