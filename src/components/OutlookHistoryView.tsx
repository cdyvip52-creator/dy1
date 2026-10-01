import React, { useState } from 'react';
import { SavedOutlook } from '../types/market';
import { StorageService } from '../services/storageService';
import { FlowDataService } from '../services/flowDataService';
import { FiveYearHistoryChart } from './FiveYearHistoryChart';
import { History, CheckCircle2, AlertCircle, Clock, Trash2, ChevronRight, Eye, Check, LineChart } from 'lucide-react';

interface OutlookHistoryViewProps {
  outlooks: SavedOutlook[];
  onRefresh: () => void;
  onApplyAssumptions?: (outlook: SavedOutlook) => void;
}

export const OutlookHistoryView: React.FC<OutlookHistoryViewProps> = ({
  outlooks,
  onRefresh,
  onApplyAssumptions,
}) => {
  const [selectedOutlook, setSelectedOutlook] = useState<SavedOutlook | null>(
    outlooks.length > 0 ? outlooks[0] : null
  );
  const [showChart, setShowChart] = useState<boolean>(true);

  // Verification modal state
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [actualKospiInput, setActualKospiInput] = useState<number>(3480);
  const [actualEpsInput, setActualEpsInput] = useState<number>(340);
  const [actualPerInput, setActualPerInput] = useState<number>(10.23);
  const [customPostMortem, setCustomPostMortem] = useState<string>('');

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('해당 전망 기록을 삭제하시겠습니까?')) {
      StorageService.deleteOutlook(id);
      onRefresh();
      if (selectedOutlook?.id === id) {
        setSelectedOutlook(null);
      }
    }
  };

  const handleOpenVerifyModal = (outlook: SavedOutlook, e: React.MouseEvent) => {
    e.stopPropagation();
    setVerifyingId(outlook.id);
    setActualKospiInput(outlook.actualOutcome?.actualKospi || 3480);
    setActualEpsInput(outlook.actualOutcome?.actualEps || outlook.assumptions.expectedEps);
    setActualPerInput(outlook.actualOutcome?.actualPer || Number((3480 / (outlook.actualOutcome?.actualEps || 340)).toFixed(2)));
    setCustomPostMortem(outlook.actualOutcome?.postMortemNotes || '');
  };

  const handleSaveVerification = () => {
    if (!verifyingId) return;
    StorageService.verifyOutlook(
      verifyingId,
      actualKospiInput,
      actualEpsInput,
      actualPerInput,
      customPostMortem.trim() || undefined
    );
    setVerifyingId(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-red-50 text-red-700">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              과거 전망 아카이브 및 사후 검증 (Post-Verification)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              과거에 기록한 6개월 KOSPI 전망을 조회하고, 실제 지수 및 EPS·PER 실현치와 비교하여 예측 오차를 검증합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChart(!showChart)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showChart
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>{showChart ? '5개년 오버레이 차트 접기' : '5개년 오버레이 차트 보기'}</span>
          </button>
          <div className="text-xs text-slate-500 font-medium">
            총 <span className="font-bold text-red-600 font-tabular">{outlooks.length}</span>건의 전망 보관 중
          </div>
        </div>
      </div>

      {/* 5-Year Historical Chart with Forecast Overlays */}
      {showChart && (
        <FiveYearHistoryChart
          outlooks={outlooks}
          onSelectOutlook={(outlook) => setSelectedOutlook(outlook)}
        />
      )}

      {/* Main Grid: Left List, Right Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-700 px-1 flex items-center justify-between">
            <span>보관된 전망 기록 목록</span>
            <span className="text-[11px] font-normal text-slate-400">클릭 시 상세 열람</span>
          </div>

          {outlooks.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
              보관된 전망 기록이 없습니다. 상단의 '전망 저장' 버튼을 눌러 기록해보세요.
            </div>
          ) : (
            <div className="space-y-2">
              {outlooks.map((item) => {
                const isSelected = selectedOutlook?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedOutlook(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-red-50/40 border-red-300 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.title}</span>
                          {item.isVerified ? (
                            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              검증 완료
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              6M 추적중
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-tabular">
                          작성일: {item.createdAt} · 작성자: {item.author}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleOpenVerifyModal(item, e)}
                          className="px-2 py-1 text-[11px] font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors whitespace-nowrap cursor-pointer"
                          title="사후 검증 데이터 입력 및 수정"
                        >
                          {item.isVerified ? '재검증' : '사후검증'}
                        </button>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400">당시 지수</div>
                        <div className="font-bold text-slate-800 font-tabular">{item.currentKospi}pt</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-red-700 font-medium">기준 목표</div>
                        <div className="font-bold text-red-950 font-tabular">{item.baseTarget}pt</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">
                          {item.isVerified ? '실제 KOSPI' : '목표 밴드'}
                        </div>
                        <div className="font-bold text-slate-900 font-tabular">
                          {item.isVerified
                            ? `${item.actualOutcome?.actualKospi}pt`
                            : `${item.bearTarget}~${item.bullTarget}`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Detail Pane (7 cols) */}
        <div className="lg:col-span-7">
          {selectedOutlook ? (
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedOutlook.title}</h3>
                    {selectedOutlook.isVerified ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        사후 검증 완료
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        진행 중
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-tabular">
                    작성일자: {selectedOutlook.createdAt} · 작성 당시 KOSPI:{' '}
                    <span className="font-bold text-slate-700">{selectedOutlook.currentKospi} pt</span>
                  </div>
                </div>

                {onApplyAssumptions && (
                  <button
                    onClick={() => onApplyAssumptions(selectedOutlook)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                    title="이 전망에 사용된 가정치를 현재 대시보드에 적용"
                  >
                    <span>이 가정 불러오기</span>
                  </button>
                )}
              </div>

              {/* SECTION: 6개월 사후 검증 결과 (Post-Verification Result) */}
              {selectedOutlook.isVerified && selectedOutlook.actualOutcome && (
                <div className="bg-gradient-to-br from-emerald-50/70 to-slate-50 p-4 rounded-xl border-2 border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>6개월 경과 사후 검증 보고서 (Post-Mortem Verification)</span>
                    </div>
                    <span className="text-[11px] text-emerald-800 font-tabular font-medium">
                      검증일: {selectedOutlook.actualOutcome.verifiedDate}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[10px] text-slate-400">당시 6개월 기준 목표</div>
                      <div className="text-base font-bold text-indigo-900 mt-0.5 font-tabular">
                        {selectedOutlook.baseTarget} pt
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[10px] text-slate-400">6개월 후 실제 KOSPI</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5 font-tabular">
                        {selectedOutlook.actualOutcome.actualKospi} pt
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[10px] text-slate-400">예측 오차 (포인트 / %)</div>
                      <div
                        className={`text-base font-bold mt-0.5 font-tabular ${
                          Math.abs(selectedOutlook.actualOutcome.errorPercent) <= 5
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {selectedOutlook.actualOutcome.errorPoints >= 0 ? '+' : ''}
                        {selectedOutlook.actualOutcome.errorPoints}pt ({selectedOutlook.actualOutcome.errorPercent}%)
                      </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                      <div className="text-[10px] text-slate-400">예상 vs 실제 EPS/PER</div>
                      <div className="text-xs font-semibold text-slate-800 mt-0.5 font-tabular">
                        EPS: {selectedOutlook.assumptions.expectedEps} vs {selectedOutlook.actualOutcome.actualEps}
                      </div>
                      <div className="text-[10px] text-slate-500 font-tabular">
                        PER: {selectedOutlook.assumptions.basePer} vs {selectedOutlook.actualOutcome.actualPer}배
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-emerald-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-emerald-950 block mb-1">💡 사후 분석 평가:</span>
                    {selectedOutlook.actualOutcome.postMortemNotes}
                  </div>
                </div>
              )}

              {/* 당시 설정된 3대 시나리오 목표치 */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-2">당시 설정된 6개월 시나리오 목표</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/20">
                    <div className="text-[11px] font-semibold text-emerald-800">강세 목표 (Bull)</div>
                    <div className="text-lg font-bold text-emerald-900 mt-0.5 font-tabular">
                      {selectedOutlook.bullTarget.toLocaleString()} pt
                    </div>
                    <div className="text-[10px] text-slate-500 font-tabular mt-0.5">
                      PER {selectedOutlook.assumptions.bullPer}배
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-indigo-300 bg-indigo-50/20">
                    <div className="text-[11px] font-bold text-indigo-900">기준 목표 (Base)</div>
                    <div className="text-lg font-bold text-indigo-950 mt-0.5 font-tabular">
                      {selectedOutlook.baseTarget.toLocaleString()} pt
                    </div>
                    <div className="text-[10px] text-slate-500 font-tabular mt-0.5">
                      PER {selectedOutlook.assumptions.basePer}배
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/20">
                    <div className="text-[11px] font-semibold text-rose-800">약세 목표 (Bear)</div>
                    <div className="text-lg font-bold text-rose-900 mt-0.5 font-tabular">
                      {selectedOutlook.bearTarget.toLocaleString()} pt
                    </div>
                    <div className="text-[10px] text-slate-500 font-tabular mt-0.5">
                      PER {selectedOutlook.assumptions.bearPer}배
                    </div>
                  </div>
                </div>
              </div>

              {/* 당시 적용된 거시 및 이익 가정 테이블 */}
              <div>
                <div className="text-xs font-bold text-slate-800 mb-2">당시 입력된 시장 및 펀더멘털 가정</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-400">예상 EPS</div>
                    <div className="font-bold text-slate-800 font-tabular">
                      {selectedOutlook.assumptions.expectedEps}원 (+{selectedOutlook.assumptions.epsGrowthRate}%)
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-400">미국 10년물 금리</div>
                    <div className="font-bold text-slate-800 font-tabular">
                      {selectedOutlook.assumptions.us10Y}%
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-400">원/달러 환율</div>
                    <div className="font-bold text-slate-800 font-tabular">
                      {selectedOutlook.assumptions.usdKrw}원
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-400">외국인 20일 순매수</div>
                    <div className="font-bold text-slate-800 font-tabular">
                      {FlowDataService.formatMoney(selectedOutlook.assumptions.foreignFlow20D)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 당시 기록된 코멘터리 요약 */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800">당시 기록된 시장 종합 판단</div>
                <div className="space-y-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200/60 leading-relaxed">
                  {selectedOutlook.commentary.overallJudgement.map((text, idx) => (
                    <p key={idx}>{text}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
              왼쪽 목록에서 열람할 전망 기록을 선택하세요.
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal Dialog */}
      {verifyingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">전망 사후 검증 (Post-Verification) 데이터 입력</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                6개월 후 실현된 실제 시장 지표를 입력하여 당시 전망과의 오차를 계산합니다.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">6개월 후 실제 KOSPI 지수 (pt)</label>
                <input
                  type="number"
                  step="1"
                  value={actualKospiInput}
                  onChange={(e) => setActualKospiInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold font-tabular text-slate-900 focus:outline-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">실제 실현 EPS (원)</label>
                  <input
                    type="number"
                    step="1"
                    value={actualEpsInput}
                    onChange={(e) => setActualEpsInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-tabular text-slate-900 focus:outline-red-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">실제 형성 PER (배)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={actualPerInput}
                    onChange={(e) => setActualPerInput(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-tabular text-slate-900 focus:outline-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  사후 분석 메모 (직접 작성 또는 자동 생성)
                </label>
                <textarea
                  rows={3}
                  value={customPostMortem}
                  onChange={(e) => setCustomPostMortem(e.target.value)}
                  placeholder="비워두면 EPS 및 PER 차이에 기반한 분석 코멘트가 자동 작성됩니다."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-red-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setVerifyingId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleSaveVerification}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                검증 결과 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
