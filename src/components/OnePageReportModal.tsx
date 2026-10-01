import React from 'react';
import { Printer, Download, X, TrendingUp, Compass, AlertCircle, FileText } from 'lucide-react';
import { ScenarioDetail, OutlookAssumptions, AutomatedCommentary } from '../types/market';
import { FlowDataService } from '../services/flowDataService';

interface OnePageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKospi: number;
  scenarios: {
    bull: ScenarioDetail;
    base: ScenarioDetail;
    bear: ScenarioDetail;
  };
  assumptions: OutlookAssumptions;
  commentary: AutomatedCommentary;
  currentPer: number;
}

export const OnePageReportModal: React.FC<OnePageReportModalProps> = ({
  isOpen,
  onClose,
  currentKospi,
  scenarios,
  assumptions,
  commentary,
  currentPer,
}) => {
  if (!isOpen) return null;

  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const handlePrint = () => {
    window.print();
  };

  // Mini scenario graph for report
  const graphMin = Math.min(scenarios.bear.targetKospi, currentKospi) - 100;
  const graphMax = Math.max(scenarios.bull.targetKospi, currentKospi) + 100;
  const getGraphPct = (val: number) => {
    return Math.max(5, Math.min(95, ((val - graphMin) / (graphMax - graphMin)) * 100));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 print:border-none print:shadow-none print:max-w-none print:rounded-none overflow-hidden my-4">
        {/* Modal Toolbar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-red-400" />
            <span className="font-bold text-sm">KOSPI 6개월 전망 보고서 (A4 1-Page 미리보기)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>보고서 인쇄 / PDF 저장</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Content Page */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 print:p-0 print:text-black">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-end justify-between">
            <div>
              <div className="text-[11px] font-bold text-red-800 tracking-wider uppercase mb-1">
                EQUITY STRATEGY RESEARCH MEMO
              </div>
              <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">
                KOSPI 6개월 전망
              </h1>
              <div className="text-xs text-slate-500 mt-1">
                EPS·PER 기반 시나리오 밸류에이션 및 매크로 리서치 요약
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="font-bold text-slate-800">작성일: {dateStr}</div>
              <div className="text-slate-500 mt-0.5">
                기준 지수: <span className="font-bold text-slate-900 font-tabular">{currentKospi.toLocaleString()} pt</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">자료: KOSPI Outlook 모델</div>
            </div>
          </div>

          {/* 1. 시장 종합 판단 */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
              1. 시장 종합 판단 (Executive Summary)
            </h2>
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 print:bg-transparent p-3 rounded border border-slate-200 print:border-slate-300">
              {commentary.overallJudgement.slice(0, 4).map((line, i) => (
                <p key={i} className="mb-1 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* 2. 6개월 전망 (표) */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
              2. 향후 6개월 시나리오별 전망 (Scenario Forecast)
            </h2>
            <div className="overflow-x-auto border border-slate-300 rounded">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3">시나리오</th>
                    <th className="py-2 px-3 text-right">예상 EPS</th>
                    <th className="py-2 px-3 text-right">적용 PER</th>
                    <th className="py-2 px-3 text-right">목표 KOSPI</th>
                    <th className="py-2 px-3 text-right">현재 대비 예상 수익률</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-red-50/25">
                    <td className="py-2 px-3 font-bold text-red-950">강세 (Bull)</td>
                    <td className="py-2 px-3 text-right font-tabular">{scenarios.bull.expectedEps.toLocaleString()}원</td>
                    <td className="py-2 px-3 text-right font-tabular">{scenarios.bull.appliedPer}배</td>
                    <td className="py-2 px-3 text-right font-bold text-red-700 font-tabular">
                      {scenarios.bull.targetKospi.toLocaleString()} pt
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-red-600 font-tabular">
                      +{scenarios.bull.returnPercent}%
                    </td>
                  </tr>
                  <tr className="bg-red-50/10 font-medium">
                    <td className="py-2 px-3 font-bold text-red-950">기준 (Base)</td>
                    <td className="py-2 px-3 text-right font-tabular">{scenarios.base.expectedEps.toLocaleString()}원</td>
                    <td className="py-2 px-3 text-right font-tabular">{scenarios.base.appliedPer}배</td>
                    <td className="py-2 px-3 text-right font-bold text-red-950 font-tabular">
                      {scenarios.base.targetKospi.toLocaleString()} pt
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-red-700 font-tabular">
                      {scenarios.base.returnPercent >= 0 ? '+' : ''}
                      {scenarios.base.returnPercent}%
                    </td>
                  </tr>
                  <tr className="bg-blue-50/25">
                    <td className="py-2 px-3 font-bold text-blue-950">약세 (Bear)</td>
                    <td className="py-2 px-3 text-right font-tabular">{scenarios.bear.expectedEps.toLocaleString()}원</td>
                    <td className="py-2 px-3 text-right font-tabular">{scenarios.bear.appliedPer}배</td>
                    <td className="py-2 px-3 text-right font-bold text-blue-700 font-tabular">
                      {scenarios.bear.targetKospi.toLocaleString()} pt
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-blue-600 font-tabular">
                      {scenarios.bear.returnPercent}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 7. 시나리오 그래프 (Report Compact Visual) */}
          <div className="p-3 bg-slate-50 print:bg-transparent rounded border border-slate-200">
            <div className="text-[11px] font-bold text-slate-800 mb-2 flex items-center justify-between">
              <span>7. 목표 지수 레인지 및 밴드 분포도</span>
              <span className="text-[10px] text-slate-400 font-normal">단위: pt</span>
            </div>
            <div className="relative h-12 flex items-center">
              {/* Range bar background */}
              <div className="absolute left-0 right-0 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 via-red-300 to-red-600"
                  style={{
                    marginLeft: `${getGraphPct(scenarios.bear.targetKospi)}%`,
                    width: `${getGraphPct(scenarios.bull.targetKospi) - getGraphPct(scenarios.bear.targetKospi)}%`,
                  }}
                ></div>
              </div>

              {/* Bear marker */}
              <div
                className="absolute text-center -translate-x-1/2"
                style={{ left: `${getGraphPct(scenarios.bear.targetKospi)}%` }}
              >
                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full mx-auto ring-2 ring-white"></div>
                <div className="text-[10px] font-bold text-blue-800 mt-1 font-tabular">
                  {scenarios.bear.targetKospi}
                </div>
              </div>

              {/* Current marker */}
              <div
                className="absolute text-center -translate-x-1/2"
                style={{ left: `${getGraphPct(currentKospi)}%` }}
              >
                <div className="w-3 h-3 bg-slate-900 rounded-full mx-auto ring-2 ring-white"></div>
                <div className="text-[10px] font-bold text-slate-900 mt-1 font-tabular">
                  현재 {Math.round(currentKospi)}
                </div>
              </div>

              {/* Base marker */}
              <div
                className="absolute text-center -translate-x-1/2"
                style={{ left: `${getGraphPct(scenarios.base.targetKospi)}%` }}
              >
                <div className="w-3.5 h-3.5 bg-red-800 rounded-full mx-auto ring-2 ring-white"></div>
                <div className="text-[10px] font-extrabold text-red-950 mt-1 font-tabular">
                  기준 {scenarios.base.targetKospi}
                </div>
              </div>

              {/* Bull marker */}
              <div
                className="absolute text-center -translate-x-1/2"
                style={{ left: `${getGraphPct(scenarios.bull.targetKospi)}%` }}
              >
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full mx-auto ring-2 ring-white"></div>
                <div className="text-[10px] font-bold text-red-700 mt-1 font-tabular">
                  {scenarios.bull.targetKospi}
                </div>
              </div>
            </div>
          </div>

          {/* 3 & 4: 핵심 상승 요인 & 하락 요인 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xs font-bold text-red-950 mb-1 flex items-center gap-1">
                <span>3. 핵심 상승 요인 (Key Bull Drivers)</span>
              </h2>
              <ul className="text-xs text-slate-700 space-y-1 pl-2">
                {commentary.bullFactors.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-red-600 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xs font-bold text-blue-950 mb-1 flex items-center gap-1">
                <span>4. 핵심 하락 요인 (Key Bear Risks)</span>
              </h2>
              <ul className="text-xs text-slate-700 space-y-1 pl-2">
                {commentary.bearFactors.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. 주요 시장 변수 */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
              5. 주요 시장 변수 일람 (Core Macro & Valuation Inputs)
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 print:bg-transparent rounded border border-slate-200">
                <div className="text-[10px] text-slate-500">KOSPI EPS</div>
                <div className="font-bold text-slate-900 font-tabular mt-0.5">{assumptions.expectedEps}원</div>
              </div>
              <div className="p-2 bg-slate-50 print:bg-transparent rounded border border-slate-200">
                <div className="text-[10px] text-slate-500">기준 PER</div>
                <div className="font-bold text-slate-900 font-tabular mt-0.5">{assumptions.basePer}배</div>
              </div>
              <div className="p-2 bg-slate-50 print:bg-transparent rounded border border-slate-200">
                <div className="text-[10px] text-slate-500">미국 10년물</div>
                <div className="font-bold text-slate-900 font-tabular mt-0.5">{assumptions.us10Y}%</div>
              </div>
              <div className="p-2 bg-slate-50 print:bg-transparent rounded border border-slate-200">
                <div className="text-[10px] text-slate-500">USD/KRW</div>
                <div className="font-bold text-slate-900 font-tabular mt-0.5">{assumptions.usdKrw}원</div>
              </div>
              <div className="p-2 bg-slate-50 print:bg-transparent rounded border border-slate-200">
                <div className="text-[10px] text-slate-500">WTI 유가</div>
                <div className="font-bold text-slate-900 font-tabular mt-0.5">${assumptions.wti}</div>
              </div>
              <div className="p-2 bg-slate-50 print:bg-transparent rounded border border-slate-200">
                <div className="text-[10px] text-slate-500">외국인 20일</div>
                <div className="font-bold text-slate-900 font-tabular mt-0.5">
                  {FlowDataService.formatMoney(assumptions.foreignFlow20D)}
                </div>
              </div>
              <div className="p-2 bg-slate-50 print:bg-transparent rounded border border-slate-200">
                <div className="text-[10px] text-slate-500">VIX 지수</div>
                <div className="font-bold text-slate-900 font-tabular mt-0.5">15.2 pt</div>
              </div>
            </div>
          </div>

          {/* 6. 투자 관찰 포인트 */}
          <div>
            <h2 className="text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-900 rounded-full"></span>
              6. 향후 6개월 투자 관찰 포인트 (Checkpoints)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {commentary.keyCheckpoints.slice(0, 4).map((cp, idx) => (
                <div key={idx} className="flex items-start gap-1.5 p-2 bg-slate-50 print:bg-transparent rounded border border-slate-200">
                  <span className="font-bold text-red-700 font-tabular">[{idx + 1}]</span>
                  <span>{cp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
            <span>본 보고서는 투자자의 합리적 지수 전망 판단을 지원하기 위해 자동 생성된 자료이며, 법적 책임의 근거로 사용될 수 없습니다.</span>
            <span>KOSPI Outlook Analysis System</span>
          </div>
        </div>
      </div>
    </div>
  );
};
