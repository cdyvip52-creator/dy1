import React, { useState } from 'react';
import { Bookmark, X, Check } from 'lucide-react';
import { OutlookAssumptions, ScenarioDetail, AutomatedCommentary } from '../types/market';
import { StorageService } from '../services/storageService';

interface SaveOutlookModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKospi: number;
  assumptions: OutlookAssumptions;
  scenarios: {
    bull: ScenarioDetail;
    base: ScenarioDetail;
    bear: ScenarioDetail;
  };
  commentary: AutomatedCommentary;
  onSaved: () => void;
}

export const SaveOutlookModal: React.FC<SaveOutlookModalProps> = ({
  isOpen,
  onClose,
  currentKospi,
  assumptions,
  scenarios,
  commentary,
  onSaved,
}) => {
  const today = new Date();
  const defaultTitle = `${today.getFullYear()}년 ${today.getMonth() + 1}월 KOSPI 6개월 전망`;
  const [title, setTitle] = useState(defaultTitle);
  const [author, setAuthor] = useState('애널리스트');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    StorageService.saveOutlook(
      title,
      Math.round(currentKospi),
      assumptions,
      scenarios,
      commentary,
      author
    );
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onSaved();
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-red-600" />
            <h3 className="text-base font-bold text-slate-900">현재 KOSPI 6개월 전망 저장</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-900">전망이 성공적으로 저장되었습니다!</div>
            <div className="text-xs text-slate-500">'전망 기록 & 사후 검증' 탭에서 언제든 확인하실 수 있습니다.</div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">전망 보고서 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-red-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">작성자 / 부서</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-red-500"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5 text-slate-600">
              <div className="font-semibold text-slate-800">저장될 주요 스냅샷:</div>
              <div className="flex justify-between font-tabular">
                <span>현재 KOSPI:</span>
                <span className="font-bold text-slate-900">{Math.round(currentKospi)} pt</span>
              </div>
              <div className="flex justify-between font-tabular">
                <span>기준 시나리오 목표:</span>
                <span className="font-bold text-red-700">{scenarios.base.targetKospi} pt ({scenarios.base.returnPercent >= 0 ? '+' : ''}{scenarios.base.returnPercent}%)</span>
              </div>
              <div className="flex justify-between font-tabular">
                <span>가정 EPS / PER:</span>
                <span>{assumptions.expectedEps}원 / {assumptions.basePer}배</span>
              </div>
              <div className="flex justify-between font-tabular">
                <span>금리 / 환율 / 유가:</span>
                <span>{assumptions.us10Y}% / {assumptions.usdKrw}원 / ${assumptions.wti}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                저장하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
