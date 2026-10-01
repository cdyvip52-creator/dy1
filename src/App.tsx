import React, { useState, useMemo } from 'react';
import { Header, NavTab } from './components/Header';
import { TopMetricsBanner } from './components/TopMetricsBanner';
import { MarketVariableCards } from './components/MarketVariableCards';
import { KospiForecastChart } from './components/KospiForecastChart';
import { FiveYearHistoryChart } from './components/FiveYearHistoryChart';
import { AssumptionPanel } from './components/AssumptionPanel';
import { ScenarioCards } from './components/ScenarioCards';
import { VariableEvaluationGrid } from './components/VariableEvaluationGrid';
import { AutomatedCommentary } from './components/AutomatedCommentary';
import { MarketDataView } from './components/MarketDataView';
import { OutlookHistoryView } from './components/OutlookHistoryView';
import { OnePageReportModal } from './components/OnePageReportModal';
import { SaveOutlookModal } from './components/SaveOutlookModal';

import { OutlookAssumptions, SavedOutlook } from './types/market';
import { MarketDataService, CURRENT_KOSPI_INDEX } from './services/marketDataService';
import { ValuationService } from './services/valuationService';
import { OutlookCalculator, DEFAULT_ASSUMPTIONS } from './services/outlookCalculator';
import { StorageService } from './services/storageService';
import { Sliders, TrendingUp, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [assumptions, setAssumptions] = useState<OutlookAssumptions>({ ...DEFAULT_ASSUMPTIONS });
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [outlooks, setOutlooks] = useState<SavedOutlook[]>(() => StorageService.getOutlooks());
  const [chartMode, setChartMode] = useState<'forecast' | 'history5y'>('forecast');

  const currentKospi = CURRENT_KOSPI_INDEX;
  const currentChange = 22.80;
  const currentChangePercent = 0.65;
  const historicalData = useMemo(() => MarketDataService.getHistoricalKospi(), []);
  const valuation = useMemo(() => ValuationService.getValuation(), []);

  // Real-time calculated scenarios
  const scenarios = useMemo(() => {
    return OutlookCalculator.calculateScenarios(currentKospi, assumptions);
  }, [currentKospi, assumptions]);

  // Real-time calculated factor evaluation
  const factors = useMemo(() => {
    return OutlookCalculator.evaluateFactors(assumptions);
  }, [assumptions]);

  // Real-time generated research commentary
  const commentary = useMemo(() => {
    return OutlookCalculator.generateCommentary(currentKospi, assumptions, scenarios);
  }, [currentKospi, assumptions, scenarios]);

  const refreshOutlooks = () => {
    setOutlooks(StorageService.getOutlooks());
  };

  const handleApplyPastAssumptions = (pastOutlook: SavedOutlook) => {
    setAssumptions({ ...pastOutlook.assumptions });
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'report') {
            setIsReportOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        savedCount={outlooks.length}
      />

      {/* Main Body Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* VIEW 1: 대시보드 (Dashboard) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top 4 Big Number Metrics */}
            <TopMetricsBanner
              currentKospi={currentKospi}
              currentChange={currentChange}
              currentChangePercent={currentChangePercent}
              scenarios={scenarios}
              expectedEps={assumptions.expectedEps}
              basePer={assumptions.basePer}
            />

            {/* 8 Market Variable Cards */}
            <MarketVariableCards
              assumptions={assumptions}
              currentPer={valuation.fwdPer}
            />

            {/* Interactive Chart Mode Switcher Segmented Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg border border-slate-200 text-xs w-fit">
                <button
                  onClick={() => setChartMode('forecast')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    chartMode === 'forecast'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                  <span>6개월 시나리오 전망 차트 (Forecast Cone)</span>
                </button>
                <button
                  onClick={() => setChartMode('history5y')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                    chartMode === 'history5y'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>5개년 매크로 & 과거전망 사후검증</span>
                  <span className="text-[10px] bg-red-100 text-red-800 px-1 rounded font-tabular">
                    NEW
                  </span>
                </button>
              </div>

              <span className="text-xs text-slate-400">
                {chartMode === 'forecast'
                  ? '현재 지수 기준 6개월 강세·기준·약세 밴드'
                  : '5개년 KOSPI·PER·국채금리·환율 상관관계 및 과거 저장된 전망 사후 분석'}
              </span>
            </div>

            {/* Central Forecast Chart OR 5-Year Historical Chart with Overlays */}
            {chartMode === 'forecast' ? (
              <KospiForecastChart
                historicalData={historicalData}
                currentKospi={currentKospi}
                scenarios={scenarios}
              />
            ) : (
              <FiveYearHistoryChart
                outlooks={outlooks}
                onSelectOutlook={handleApplyPastAssumptions}
              />
            )}

            {/* Quick Assumption Control Bar & Jump to full adjustment */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50 text-red-700">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    전망 핵심 변수: EPS {assumptions.expectedEps}원 × PER {assumptions.basePer}배 = 목표 {scenarios.base.targetKospi.toLocaleString()}pt
                  </div>
                  <div className="text-[11px] text-slate-500">
                    미국 10년물 {assumptions.us10Y}% · USD/KRW {assumptions.usdKrw}원 · WTI ${assumptions.wti}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('analysis')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>가정 상세 수정하기</span>
                </button>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <span>1페이지 보고서 보기</span>
                </button>
              </div>
            </div>

            {/* 3 Scenarios Details (Bull, Base, Bear) */}
            <ScenarioCards scenarios={scenarios} currentKospi={currentKospi} />

            {/* 8 Variable Factors Evaluation Grid (5 Stages) */}
            <VariableEvaluationGrid factors={factors} />

            {/* Automated Commentary Digest */}
            <AutomatedCommentary commentary={commentary} />
          </div>
        )}

        {/* VIEW 2: 전망 분석 및 가정 수정 (Analysis & Assumptions) */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Top 4 Big Number Metrics for live feedback */}
            <TopMetricsBanner
              currentKospi={currentKospi}
              currentChange={currentChange}
              currentChangePercent={currentChangePercent}
              scenarios={scenarios}
              expectedEps={assumptions.expectedEps}
              basePer={assumptions.basePer}
            />

            {/* Assumption Panel with live Sliders & Inputs */}
            <AssumptionPanel
              assumptions={assumptions}
              onChange={setAssumptions}
              onReset={() => setAssumptions({ ...DEFAULT_ASSUMPTIONS })}
              currentKospi={currentKospi}
            />

            {/* Live Forecast Chart reacting to new inputs */}
            <KospiForecastChart
              historicalData={historicalData}
              currentKospi={currentKospi}
              scenarios={scenarios}
            />

            {/* 3 Scenarios */}
            <ScenarioCards scenarios={scenarios} currentKospi={currentKospi} />

            {/* Automated Commentary */}
            <AutomatedCommentary commentary={commentary} />
          </div>
        )}

        {/* VIEW 3: 시장 데이터 (Market Data A~H) */}
        {activeTab === 'market_data' && <MarketDataView />}

        {/* VIEW 4: 전망 기록 및 사후 검증 (History & Post-Verification) */}
        {activeTab === 'history' && (
          <OutlookHistoryView
            outlooks={outlooks}
            onRefresh={refreshOutlooks}
            onApplyAssumptions={handleApplyPastAssumptions}
          />
        )}
      </main>

      {/* 1-Page Report Modal */}
      <OnePageReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        currentKospi={currentKospi}
        scenarios={scenarios}
        assumptions={assumptions}
        commentary={commentary}
        currentPer={valuation.fwdPer}
      />

      {/* Save Outlook Modal */}
      <SaveOutlookModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentKospi={currentKospi}
        assumptions={assumptions}
        scenarios={scenarios}
        commentary={commentary}
        onSaved={refreshOutlooks}
      />

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">KOSPI Outlook</span>
            <span>·</span>
            <span>KOSPI 6개월 전망 분석 시스템</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-tabular">
              v1.0 MVP
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>※ 본 시스템은 투자 참고용 시뮬레이션 모델이며 원금 손실 위험이 있습니다.</span>
            <span>데이터: 가상 데모 피드</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
