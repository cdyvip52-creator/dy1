import React from 'react';
import { RotateCcw, Sliders, TrendingUp, DollarSign, Layers, Zap } from 'lucide-react';
import { OutlookAssumptions } from '../types/market';
import { DEFAULT_ASSUMPTIONS, OutlookCalculator } from '../services/outlookCalculator';
import { FlowDataService } from '../services/flowDataService';

interface AssumptionPanelProps {
  assumptions: OutlookAssumptions;
  onChange: (newAssumptions: OutlookAssumptions) => void;
  onReset: () => void;
  currentKospi: number;
}

export const AssumptionPanel: React.FC<AssumptionPanelProps> = ({
  assumptions,
  onChange,
  onReset,
  currentKospi,
}) => {
  const impliedCurrentEps = Math.round(currentKospi / assumptions.basePer);
  const minEps = Math.max(100, Math.round(impliedCurrentEps * 0.6));
  const maxEps = Math.round(impliedCurrentEps * 1.6);
  const baseGrowthEps = Math.round(impliedCurrentEps * 1.15);
  const boomEps = Math.round(impliedCurrentEps * 1.3);
  const bearEpsBound = Math.round(impliedCurrentEps * 0.85);

  const update = <K extends keyof OutlookAssumptions>(key: K, value: OutlookAssumptions[K]) => {
    onChange({
      ...assumptions,
      [key]: value,
    });
  };

  const handleSyncToLive = () => {
    const autoEps = Math.round(impliedCurrentEps * (1 + assumptions.epsGrowthRate / 100));
    update('expectedEps', autoEps);
  };

  // Preset scenarios dynamically scaled to real-time KOSPI
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case 'base':
        onChange({
          ...assumptions,
          expectedEps: baseGrowthEps,
          epsGrowthRate: 15.0,
          bullPer: 11.5,
          basePer: 10.5,
          bearPer: 9.2,
        });
        break;
      case 'semi_boom':
        onChange({
          ...assumptions,
          expectedEps: boomEps,
          epsGrowthRate: 22.0,
          bullPer: 12.0,
          basePer: 11.0,
          bearPer: 9.6,
          us10Y: 3.95,
          usdKrw: Math.max(1250, assumptions.usdKrw - 35),
          foreignFlow20D: 45000,
        });
        break;
      case 'rate_spike':
        onChange({
          ...assumptions,
          expectedEps: Math.round(impliedCurrentEps * 1.06),
          epsGrowthRate: 8.0,
          bullPer: 10.8,
          basePer: 9.8,
          bearPer: 8.6,
          us10Y: 4.55,
          usdKrw: assumptions.usdKrw + 25,
          foreignFlow20D: -12000,
        });
        break;
      case 'fx_stress':
        onChange({
          ...assumptions,
          expectedEps: bearEpsBound,
          epsGrowthRate: 5.0,
          bullPer: 10.5,
          basePer: 9.5,
          bearPer: 8.5,
          us10Y: 4.40,
          usdKrw: 1435,
          wti: 86.0,
          foreignFlow20D: -25000,
        });
        break;
    }
  };

  // Immediate target recalculation indicator
  const targetQuick = Math.round(assumptions.expectedEps * assumptions.basePer);
  const targetDiff = targetQuick - Math.round(currentKospi);
  const targetPct = Number(((targetDiff / currentKospi) * 100).toFixed(1));

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-50 text-red-700">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">전망 가정 실시간 조정 (Assumption Control)</h3>
            <p className="text-xs text-slate-500">값 수정 즉시 목표 KOSPI와 시나리오가 실시간 재계산됩니다.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
            title="초기 기본 가정값으로 복원"
          >
            <RotateCcw className="w-3 h-3" />
            초기화
          </button>
        </div>
      </div>

      {/* Preset Buttons */}
      <div>
        <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          <span>시나리오 프리셋 원클릭 적용:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => applyPreset('base')}
            className="px-2.5 py-1.5 text-xs font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors text-center"
          >
            기본 시나리오
          </button>
          <button
            onClick={() => applyPreset('semi_boom')}
            className="px-2.5 py-1.5 text-xs font-medium bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-emerald-800 transition-colors text-center"
          >
            🚀 반도체 슈퍼사이클
          </button>
          <button
            onClick={() => applyPreset('rate_spike')}
            className="px-2.5 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-lg text-amber-900 transition-colors text-center"
          >
            ⚠️ 미국 금리 재상승
          </button>
          <button
            onClick={() => applyPreset('fx_stress')}
            className="px-2.5 py-1.5 text-xs font-medium bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-lg text-rose-800 transition-colors text-center"
          >
            📉 고환율 / 외인 유출
          </button>
        </div>
      </div>

      {/* Section 1: 기업이익 (EPS) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-red-600" />
            1. 기업이익 (Earnings Assumptions)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-tabular">
              실시간 KOSPI({currentKospi.toLocaleString()}pt) 내재 EPS: <strong className="text-slate-800">{impliedCurrentEps.toLocaleString()}원</strong>
            </span>
            <button
              onClick={handleSyncToLive}
              className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded border border-red-200 transition-colors cursor-pointer"
              title="현재 실시간 KOSPI 지수와 설정된 성장률에 맞춰 예상 EPS를 자동 산출합니다"
            >
              <Zap className="w-3 h-3 text-red-600" />
              <span>실시간 동기화</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/60">
          {/* Expected EPS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="expected-eps-input" className="text-slate-600 font-medium">KOSPI 예상 12M Fwd EPS</label>
              <div className="flex items-center gap-1">
                <input
                  id="expected-eps-input"
                  type="number"
                  min={minEps}
                  max={maxEps}
                  step="1"
                  value={assumptions.expectedEps}
                  onChange={(e) => update('expectedEps', Math.max(10, Number(e.target.value) || 0))}
                  className="w-24 px-2 py-0.5 text-right font-bold text-xs bg-white border border-slate-300 rounded font-tabular focus:outline-red-500"
                />
                <span className="text-slate-500 text-xs">원</span>
              </div>
            </div>
            <input
              type="range"
              min={minEps}
              max={maxEps}
              step="1"
              value={assumptions.expectedEps}
              onChange={(e) => update('expectedEps', Number(e.target.value))}
              aria-label="KOSPI 예상 12M Fwd EPS 슬라이더"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-tabular">
              <span>{minEps.toLocaleString()}원 (하단)</span>
              <span>{baseGrowthEps.toLocaleString()}원 (기준 +15%)</span>
              <span>{maxEps.toLocaleString()}원 (상단)</span>
            </div>
          </div>

          {/* EPS Growth Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="eps-growth-input" className="text-slate-600 font-medium">연간 EPS 예상 성장률 (%)</label>
              <div className="flex items-center gap-1">
                <input
                  id="eps-growth-input"
                  type="number"
                  min="-20"
                  max="40"
                  step="0.5"
                  value={assumptions.epsGrowthRate}
                  onChange={(e) => update('epsGrowthRate', Number(e.target.value) || 0)}
                  className="w-20 px-2 py-0.5 text-right font-bold text-xs bg-white border border-slate-300 rounded font-tabular focus:outline-red-500"
                />
                <span className="text-slate-500 text-xs">%</span>
              </div>
            </div>
            <input
              type="range"
              min="-10"
              max="35"
              step="0.5"
              value={assumptions.epsGrowthRate}
              onChange={(e) => update('epsGrowthRate', Number(e.target.value))}
              aria-label="연간 EPS 예상 성장률 슬라이더"
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-tabular">
              <span>-10%</span>
              <span>+15% (컨센서스)</span>
              <span>+35%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: 밸류에이션 적용 PER */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-red-600" />
            2. 시나리오별 적용 PER 배수 (Valuation Multiples)
          </span>
          <span className="text-[11px] text-slate-400">5년 평균: 10.8배 · 10년 평균: 10.5배</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 강세 PER */}
          <div className="bg-red-50/30 p-3 rounded-lg border border-red-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="bull-per-input" className="text-red-900 font-bold">강세 적용 PER</label>
              <div className="flex items-center gap-1">
                <input
                  id="bull-per-input"
                  type="number"
                  min="9.0"
                  max="14.0"
                  step="0.1"
                  value={assumptions.bullPer}
                  onChange={(e) => update('bullPer', Number(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 text-right font-bold text-xs bg-white border border-red-300 rounded font-tabular focus:outline-red-600"
                />
                <span className="text-red-700 text-xs font-medium">배</span>
              </div>
            </div>
            <input
              type="range"
              min="9.5"
              max="13.5"
              step="0.1"
              value={assumptions.bullPer}
              onChange={(e) => update('bullPer', Number(e.target.value))}
              aria-label="강세 적용 PER 슬라이더"
              className="w-full h-1.5 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="text-[10px] text-red-700 font-bold font-tabular text-right">
              강세 목표: ~{Math.round(assumptions.expectedEps * 1.05 * assumptions.bullPer).toLocaleString()}pt
            </div>
          </div>

          {/* 기준 PER */}
          <div className="bg-red-50/15 p-3 rounded-lg border-2 border-red-400 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="base-per-input" className="text-red-950 font-bold">기준 적용 PER</label>
              <div className="flex items-center gap-1">
                <input
                  id="base-per-input"
                  type="number"
                  min="8.0"
                  max="13.0"
                  step="0.1"
                  value={assumptions.basePer}
                  onChange={(e) => update('basePer', Number(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 text-right font-bold text-xs bg-white border border-red-400 rounded font-tabular focus:outline-red-600"
                />
                <span className="text-red-800 text-xs font-medium">배</span>
              </div>
            </div>
            <input
              type="range"
              min="8.5"
              max="12.5"
              step="0.1"
              value={assumptions.basePer}
              onChange={(e) => update('basePer', Number(e.target.value))}
              aria-label="기준 적용 PER 슬라이더"
              className="w-full h-1.5 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-700"
            />
            <div className="text-[10px] text-red-950 font-extrabold font-tabular text-right">
              기준 목표: {Math.round(assumptions.expectedEps * assumptions.basePer).toLocaleString()}pt
            </div>
          </div>

          {/* 약세 PER */}
          <div className="bg-blue-50/30 p-3 rounded-lg border border-blue-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="bear-per-input" className="text-blue-900 font-bold">약세 적용 PER</label>
              <div className="flex items-center gap-1">
                <input
                  id="bear-per-input"
                  type="number"
                  min="7.0"
                  max="11.0"
                  step="0.1"
                  value={assumptions.bearPer}
                  onChange={(e) => update('bearPer', Number(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 text-right font-bold text-xs bg-white border border-blue-300 rounded font-tabular focus:outline-blue-600"
                />
                <span className="text-blue-700 text-xs font-medium">배</span>
              </div>
            </div>
            <input
              type="range"
              min="7.5"
              max="10.5"
              step="0.1"
              value={assumptions.bearPer}
              onChange={(e) => update('bearPer', Number(e.target.value))}
              aria-label="약세 적용 PER 슬라이더"
              className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="text-[10px] text-blue-700 font-bold font-tabular text-right">
              약세 목표: ~{Math.round(assumptions.expectedEps * 0.94 * assumptions.bearPer).toLocaleString()}pt
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: 시장 환경 변수 (금리, 환율, 유가, 외인수급) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">
            3. 거시경제 및 수급 환경 (Macro & Flow Inputs)
          </span>
          <span className="text-[11px] text-slate-400">시장 변수 영향도 반영</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/60 p-3.5 rounded-lg border border-slate-200/60">
          {/* US 10Y Yield */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="us-10y-input" className="text-slate-600 font-medium">미국 10년물 금리</label>
              <div className="flex items-center gap-0.5">
                <input
                  id="us-10y-input"
                  type="number"
                  step="0.05"
                  value={assumptions.us10Y}
                  onChange={(e) => update('us10Y', Number(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 text-right font-bold text-xs bg-white border border-slate-300 rounded font-tabular focus:outline-red-500"
                />
                <span className="text-slate-500 text-xs">%</span>
              </div>
            </div>
            <input
              type="range"
              min="3.2"
              max="5.0"
              step="0.05"
              value={assumptions.us10Y}
              onChange={(e) => update('us10Y', Number(e.target.value))}
              aria-label="미국 10년물 금리 슬라이더"
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* USD/KRW */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="usd-krw-input" className="text-slate-600 font-medium">원/달러 환율</label>
              <div className="flex items-center gap-0.5">
                <input
                  id="usd-krw-input"
                  type="number"
                  step="1"
                  value={assumptions.usdKrw}
                  onChange={(e) => update('usdKrw', Number(e.target.value) || 0)}
                  className="w-18 px-1.5 py-0.5 text-right font-bold text-xs bg-white border border-slate-300 rounded font-tabular focus:outline-red-500"
                />
                <span className="text-slate-500 text-xs">원</span>
              </div>
            </div>
            <input
              type="range"
              min="1280"
              max="1450"
              step="5"
              value={assumptions.usdKrw}
              onChange={(e) => update('usdKrw', Number(e.target.value))}
              aria-label="원/달러 환율 슬라이더"
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* WTI */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="wti-oil-input" className="text-slate-600 font-medium">WTI 유가</label>
              <div className="flex items-center gap-0.5">
                <input
                  id="wti-oil-input"
                  type="number"
                  step="0.5"
                  value={assumptions.wti}
                  onChange={(e) => update('wti', Number(e.target.value) || 0)}
                  className="w-16 px-1.5 py-0.5 text-right font-bold text-xs bg-white border border-slate-300 rounded font-tabular focus:outline-red-500"
                />
                <span className="text-slate-500 text-xs">$</span>
              </div>
            </div>
            <input
              type="range"
              min="60"
              max="100"
              step="0.5"
              value={assumptions.wti}
              onChange={(e) => update('wti', Number(e.target.value))}
              aria-label="WTI 유가 슬라이더"
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
          </div>

          {/* Foreign Flow 20D */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="foreign-flow-input" className="text-slate-600 font-medium">외국인 20일 순매수</label>
              <div className="flex items-center gap-0.5">
                <input
                  id="foreign-flow-input"
                  type="number"
                  step="1000"
                  value={assumptions.foreignFlow20D}
                  onChange={(e) => update('foreignFlow20D', Number(e.target.value) || 0)}
                  className="w-20 px-1.5 py-0.5 text-right font-bold text-xs bg-white border border-slate-300 rounded font-tabular focus:outline-red-500"
                />
                <span className="text-slate-500 text-xs">억</span>
              </div>
            </div>
            <input
              type="range"
              min="-30000"
              max="50000"
              step="1000"
              value={assumptions.foreignFlow20D}
              onChange={(e) => update('foreignFlow20D', Number(e.target.value))}
              aria-label="외국인 20일 순매수 슬라이더"
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <div className="text-[10px] text-slate-500 font-tabular text-right">
              {FlowDataService.formatMoney(assumptions.foreignFlow20D)}
            </div>
          </div>
        </div>
      </div>

      {/* Immediate recalculation preview banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white p-3.5 rounded-lg flex items-center justify-between">
        <div>
          <div className="text-xs text-red-200">실시간 재계산 공식: KOSPI 적정지수 = 예상 EPS × 적용 PER</div>
          <div className="text-sm font-semibold mt-0.5">
            {assumptions.expectedEps}원 × {assumptions.basePer}배 ={' '}
            <span className="text-lg font-bold text-red-300 font-tabular">{targetQuick.toLocaleString()} pt</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-red-200">현재 대비 예상 변동</div>
          <div className={`text-base font-bold font-tabular ${targetPct >= 0 ? 'text-red-400' : 'text-blue-400'}`}>
            {targetPct >= 0 ? '+' : ''}{targetPct}% ({targetDiff >= 0 ? '+' : ''}{targetDiff.toLocaleString()}pt)
          </div>
        </div>
      </div>
    </div>
  );
};
