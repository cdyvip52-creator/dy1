import React from 'react';
import { ArrowUpRight, ArrowDownRight, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ScenarioDetail } from '../types/market';

interface ScenarioCardsProps {
  scenarios: {
    bull: ScenarioDetail;
    base: ScenarioDetail;
    bear: ScenarioDetail;
  };
  currentKospi: number;
}

export const ScenarioCards: React.FC<ScenarioCardsProps> = ({ scenarios, currentKospi }) => {
  const items = [
    {
      scenario: scenarios.bull,
      theme: {
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-800',
        accentText: 'text-red-700',
        cardBg: 'bg-red-50/25',
        icon: <ArrowUpRight className="w-4 h-4 text-red-600" />,
      },
    },
    {
      scenario: scenarios.base,
      theme: {
        border: 'border-red-300 ring-1 ring-red-200',
        badge: 'bg-red-700 text-white font-bold',
        accentText: 'text-red-950',
        cardBg: 'bg-red-50/15',
        icon: <ShieldCheck className="w-4 h-4 text-red-700" />,
      },
    },
    {
      scenario: scenarios.bear,
      theme: {
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800',
        accentText: 'text-blue-700',
        cardBg: 'bg-blue-50/25',
        icon: <ArrowDownRight className="w-4 h-4 text-blue-600" />,
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <span>6개월 3대 시나리오 상세 분석 (강세 · 기준 · 약세)</span>
          <span className="text-[11px] font-normal text-slate-400">· 가치평가 및 성립 조건</span>
        </h2>
        <span className="text-xs text-slate-500">현재 지수: {currentKospi.toLocaleString()}pt</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(({ scenario, theme }) => {
          const delta = scenario.targetKospi - Math.round(currentKospi);
          const isPlus = delta >= 0;

          return (
            <div
              key={scenario.type}
              className={`rounded-xl border ${theme.border} ${theme.cardBg} p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    {theme.icon}
                    <span className="text-slate-900">{scenario.name}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${theme.badge}`}>
                    PER {scenario.appliedPer}x
                  </span>
                </div>

                {/* Target Number */}
                <div className="mt-2 flex items-baseline justify-between border-b border-slate-200/60 pb-3">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">목표 KOSPI</div>
                    <div className="text-2xl font-extrabold text-slate-900 font-tabular">
                      {scenario.targetKospi.toLocaleString()}
                      <span className="text-xs font-normal text-slate-400 ml-1">pt</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400 font-medium">현재 대비</div>
                    <div className={`text-base font-bold font-tabular ${theme.accentText}`}>
                      {isPlus ? '+' : ''}
                      {scenario.returnPercent}%
                    </div>
                    <div className="text-[10px] text-slate-400 font-tabular">
                      ({isPlus ? '+' : ''}
                      {delta.toLocaleString()}pt)
                    </div>
                  </div>
                </div>

                {/* Valuation Formula Breakdown */}
                <div className="py-2.5 border-b border-slate-200/60 text-xs flex items-center justify-between text-slate-600">
                  <span className="text-slate-500">적용 EPS × PER:</span>
                  <span className="font-semibold text-slate-800 font-tabular">
                    {scenario.expectedEps.toLocaleString()}원 × {scenario.appliedPer}배
                  </span>
                </div>

                {/* Conditions */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>시나리오 성립 조건:</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {scenario.conditions.map((cond, i) => (
                      <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-slate-400 text-[10px] mt-0.5">·</span>
                        <span>{cond}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Risks */}
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3 h-3 text-slate-400" />
                  <span>주요 리스크 요인:</span>
                </div>
                <ul className="space-y-0.5 text-[11px] text-slate-500">
                  {scenario.keyRisks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-slate-400">-</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
