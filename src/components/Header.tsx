import React from 'react';
import { Bookmark, FileText, BarChart3, Database, History, TrendingUp, Download, RefreshCw, Radio } from 'lucide-react';

export type NavTab = 'dashboard' | 'analysis' | 'market_data' | 'history' | 'report';

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenReport: () => void;
  onOpenSaveModal: () => void;
  onExportCSV?: () => void;
  onRefreshLive?: () => void;
  isRefreshing?: boolean;
  isLive?: boolean;
  lastUpdated?: string;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenReport,
  onOpenSaveModal,
  onExportCSV,
  onRefreshLive,
  isRefreshing = false,
  isLive = true,
  lastUpdated,
  savedCount,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Real-time Financial Data Feed Ribbon */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isLive ? '실시간 금융 API 연동' : '로컬 기준 데이터'}</span>
          </div>
          <span className="text-slate-400 text-[11px] hidden sm:inline">
            글로벌 증시·국채·환율·원자재 실시간 시세 반영
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          {lastUpdated && (
            <span className="font-tabular text-slate-400 hidden md:inline">
              수신: {lastUpdated}
            </span>
          )}
          {onRefreshLive && (
            <button
              onClick={onRefreshLive}
              disabled={isRefreshing}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
              title="외부 금융 API 실시간 시세를 즉시 재조회합니다"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-red-400' : 'text-slate-400'}`} />
              <span>{isRefreshing ? '조회중...' : '시세 새로고침'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Nav Bar (Strict 3-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Brand Element */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                    KOSPI Outlook
                  </span>
                  <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                    6M Forecast
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-normal">KOSPI 6개월 전망 분석 시스템</div>
              </div>
            </button>
          </div>

          {/* Zone 2: 5 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-red-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              대시보드
            </button>
            <button
              onClick={() => onTabChange('analysis')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'analysis'
                  ? 'bg-white text-red-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              전망 분석 & 가정 수정
            </button>
            <button
              onClick={() => onTabChange('market_data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'market_data'
                  ? 'bg-white text-red-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              시장 데이터 (A~H)
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-red-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              전망 기록 & 사후 검증
              {savedCount > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded-full font-tabular">
                  {savedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onTabChange('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-white text-red-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              보고서 미리보기
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            {onExportCSV && (
              <button
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors shadow-xs whitespace-nowrap cursor-pointer"
                title="현재 시나리오와 분석 데이터를 Excel 호환 CSV 파일로 내보냅니다"
              >
                <Download className="w-3.5 h-3.5 text-red-600" />
                <span>CSV 내보내기</span>
              </button>
            )}
            <button
              onClick={onOpenSaveModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              title="현재 가정을 과거 전망 목록에 저장합니다"
            >
              <Bookmark className="w-3.5 h-3.5 text-red-600" />
              <span>전망 저장</span>
            </button>
            <button
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs whitespace-nowrap cursor-pointer"
              title="A4 1페이지 리서치 보고서를 생성합니다"
            >
              <FileText className="w-3.5 h-3.5 text-red-200" />
              <span>1페이지 보고서 생성</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 text-xs">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${activeTab === 'dashboard' ? 'font-bold text-red-600 bg-red-50' : 'text-slate-600'}`}
          >
            대시보드
          </button>
          <button
            onClick={() => onTabChange('analysis')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${activeTab === 'analysis' ? 'font-bold text-red-600 bg-red-50' : 'text-slate-600'}`}
          >
            전망 분석
          </button>
          <button
            onClick={() => onTabChange('market_data')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${activeTab === 'market_data' ? 'font-bold text-red-600 bg-red-50' : 'text-slate-600'}`}
          >
            시장 데이터
          </button>
          <button
            onClick={() => onTabChange('history')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${activeTab === 'history' ? 'font-bold text-red-600 bg-red-50' : 'text-slate-600'}`}
          >
            전망 기록
          </button>
          <button
            onClick={() => onTabChange('report')}
            className={`px-2.5 py-1 rounded whitespace-nowrap cursor-pointer ${activeTab === 'report' ? 'font-bold text-red-600 bg-red-50' : 'text-slate-600'}`}
          >
            보고서
          </button>
        </div>
      </div>
    </header>
  );
};
