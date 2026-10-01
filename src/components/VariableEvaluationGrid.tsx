import React from 'react';
import { VariableFactorEvaluation, SentimentLevel } from '../types/market';
import { TrendingUp, Cpu, Landmark, CircleDollarSign, Users, LineChart, BarChart2, Globe } from 'lucide-react';

interface VariableEvaluationGridProps {
  factors: VariableFactorEvaluation[];
}

export const VariableEvaluationGrid: React.FC<VariableEvaluationGridProps> = ({ factors }) => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'earnings':
        return <TrendingUp className="w-4 h-4" />;
      case 'semiconductor':
        return <Cpu className="w-4 h-4" />;
      case 'interest_rate':
        return <Landmark className="w-4 h-4" />;
      case 'foreign_exchange':
        return <CircleDollarSign className="w-4 h-4" />;
      case 'foreign_flow':
        return <Users className="w-4 h-4" />;
      case 'macro_economy':
        return <LineChart className="w-4 h-4" />;
      case 'valuation':
        return <BarChart2 className="w-4 h-4" />;
      case 'risk_appetite':
        return <Globe className="w-4 h-4" />;
      default:
        return <BarChart2 className="w-4 h-4" />;
    }
  };

  const getScoreBadge = (score: SentimentLevel) => {
    switch (score) {
      case 'very_bullish':
        return {
          bg: 'bg-red-100 text-red-950 border-red-300 font-bold',
          indicatorColor: 'bg-red-600',
          label: '매우 긍정적',
        };
      case 'bullish':
        return {
          bg: 'bg-red-50 text-red-800 border-red-200 font-bold',
          indicatorColor: 'bg-red-500',
          label: '긍정적',
        };
      case 'neutral':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          indicatorColor: 'bg-slate-400',
          label: '중립',
        };
      case 'bearish':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200 font-bold',
          indicatorColor: 'bg-blue-400',
          label: '부정적',
        };
      case 'very_bearish':
        return {
          bg: 'bg-blue-100 text-blue-950 border-blue-300 font-bold',
          indicatorColor: 'bg-blue-600',
          label: '매우 부정적',
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>8대 거시·시장 변수 정밀 평가 (5단계 스케일)</span>
            <span className="text-[11px] font-normal text-slate-500">· 가중치 및 체감 영향도</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            기업이익·금리·환율 등 핵심 8개 변수의 현재 수준을 다각도로 평가하여 지수 모멘텀을 산출합니다.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> 긍정적
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> 중립
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> 부정적
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {factors.map((factor) => {
          const badge = getScoreBadge(factor.score);
          return (
            <div
              key={factor.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <span className="text-slate-500">{getIcon(factor.id)}</span>
                    <span>{factor.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${badge.bg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.indicatorColor}`}></span>
                    {badge.label}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {factor.summary}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {factor.detail}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>지수 영향 가중치:</span>
                <span className="font-semibold text-slate-600">{factor.impactWeight}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
