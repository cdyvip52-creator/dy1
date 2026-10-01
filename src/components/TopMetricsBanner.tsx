import React from 'react';
import { ArrowUpRight, ArrowDownRight, Compass, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { ScenarioDetail } from '../types/market';

interface TopMetricsBannerProps {
  currentKospi: number;
  currentChange: number;
  currentChangePercent: number;
  scenarios: {
    bull: ScenarioDetail;
    base: ScenarioDetail;
    bear: ScenarioDetail;
  };
  expectedEps: number;
  basePer: number;
}

export const TopMetricsBanner: React.FC<TopMetricsBannerProps> = ({
  currentKospi,
  currentChange,
  currentChangePercent,
  scenarios,
  expectedEps,
  basePer,
}) => {
  const isCurrentUp = currentChange >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. 현재 KOSPI */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1.5">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>현재 KOSPI 지수</span>
          </div>
          <span className="text-[11px] text-slate-400">실시간 기준</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 font-tabular">
            {currentKospi.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-400">pt</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center font-bold font-tabular ${
              isCurrentUp ? 'text-red-600' : 'text-blue-600'
            }`}
          >
            {isCurrentUp ? '+' : ''}
            {currentChange.toFixed(2)}pt ({isCurrentUp ? '+' : ''}
            {currentChangePercent.toFixed(2)}%)
          </span>
          <span className="text-slate-400">· 전일대비</span>
        </div>
      </div>

      {/* 2. 6개월 기준 시나리오 목표 (Base) */}
      <div className="bg-white rounded-xl border-2 border-red-300 p-5 shadow-xs hover:border-red-400 transition-all relative overflow-hidden bg-gradient-to-br from-white via-red-50/20 to-white">
        <div className="flex items-center justify-between text-red-950 text-xs font-semibold mb-1.5">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-red-600" />
            <span>6개월 기준 전망 (Base)</span>
          </div>
          <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
            적용 {basePer}x
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-red-950 font-tabular">
            {scenarios.base.targetKospi.toLocaleString()}
          </span>
          <span className="text-xs text-red-400">pt</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center font-bold font-tabular ${
              scenarios.base.returnPercent >= 0 ? 'text-red-600' : 'text-blue-600'
            }`}
          >
            {scenarios.base.returnPercent >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            )}
            {scenarios.base.returnPercent >= 0 ? '+' : ''}
            {scenarios.base.returnPercent}%
          </span>
          <span className="text-slate-500 font-tabular">
            ({scenarios.base.targetKospi - Math.round(currentKospi) >= 0 ? '+' : ''}
            {(scenarios.base.targetKospi - Math.round(currentKospi)).toLocaleString()}pt)
          </span>
        </div>
      </div>

      {/* 3. 강세 목표 (Bull) - 한국 시장 관행: 상승은 빨간색 */}
      <div className="bg-white rounded-xl border border-red-200 p-5 shadow-xs hover:border-red-300 transition-all bg-gradient-to-br from-white to-red-50/30">
        <div className="flex items-center justify-between text-slate-700 text-xs font-medium mb-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-600" />
            <span className="text-red-900 font-bold">강세 목표 (Bull)</span>
          </div>
          <span className="text-[10px] text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 font-medium">적용 {scenarios.bull.appliedPer}x</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 font-tabular">
            {scenarios.bull.targetKospi.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">pt</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center font-bold text-red-600 font-tabular">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
            +{scenarios.bull.returnPercent}%
          </span>
          <span className="text-slate-400 font-tabular">
            (+{(scenarios.bull.targetKospi - Math.round(currentKospi)).toLocaleString()}pt)
          </span>
        </div>
      </div>

      {/* 4. 약세 목표 (Bear) - 한국 시장 관행: 하락은 파란색 */}
      <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs hover:border-blue-300 transition-all bg-gradient-to-br from-white to-blue-50/30">
        <div className="flex items-center justify-between text-slate-700 text-xs font-medium mb-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-blue-900 font-bold">약세 목표 (Bear)</span>
          </div>
          <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-medium">적용 {scenarios.bear.appliedPer}x</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 font-tabular">
            {scenarios.bear.targetKospi.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">pt</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          <span className="inline-flex items-center font-bold text-blue-600 font-tabular">
            <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
            {scenarios.bear.returnPercent}%
          </span>
          <span className="text-slate-400 font-tabular">
            ({(scenarios.bear.targetKospi - Math.round(currentKospi)).toLocaleString()}pt)
          </span>
        </div>
      </div>
    </div>
  );
};

