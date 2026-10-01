import React from 'react';
import { FileSpreadsheet, CheckCircle2, AlertTriangle, KeyRound, HelpCircle } from 'lucide-react';
import { AutomatedCommentary as CommentaryType } from '../types/market';

interface AutomatedCommentaryProps {
  commentary: CommentaryType;
}

export const AutomatedCommentary: React.FC<AutomatedCommentaryProps> = ({ commentary }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-slate-900 text-white">
            <FileSpreadsheet className="w-4 h-4 text-red-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              자동 분석 코멘터리 (Automated Research Digest)
            </h2>
            <p className="text-xs text-slate-500">
              현재 시장 데이터 및 사용자 가정을 바탕으로 작성된 기관 리서치 수준의 분석 메모입니다.
            </p>
          </div>
        </div>
        <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          분석 준칙: 과장 지양·데이터 기반
        </span>
      </div>

      {/* 1. 시장 종합 판단 (3~5문장) */}
      <div className="bg-slate-50/80 rounded-lg p-4 border border-slate-200/80">
        <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          1. 시장 종합 판단 (Market Summary)
        </h3>
        <div className="space-y-1.5 text-xs text-slate-700 leading-relaxed">
          {commentary.overallJudgement.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Key Question Answer Callout */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white rounded-lg p-4 shadow-xs">
        <div className="flex items-center gap-2 text-red-300 text-xs font-bold mb-1.5">
          <HelpCircle className="w-4 h-4 text-red-400" />
          <span>핵심 관찰 질문: “향후 6개월 KOSPI 방향을 결정할 가장 중요한 변수는 무엇인가?”</span>
        </div>
        <p className="text-xs text-red-100 leading-relaxed font-medium">
          {commentary.primaryDriverAnswer}
        </p>
      </div>

      {/* 2-Column: 상승 요인 vs 하락 요인 (한국 시장: 상승 빨간색, 하락 파란색) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 상승 요인 (최대 5개) - 빨간색 */}
        <div className="p-4 rounded-lg border border-red-200 bg-red-50/30">
          <h3 className="text-xs font-bold text-red-950 mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-red-600" />
            <span>2. 핵심 상승 동인 (Bullish Drivers)</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {commentary.bullFactors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-red-600 font-bold text-xs mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 하락 요인 (최대 5개) - 파란색 */}
        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/30">
          <h3 className="text-xs font-bold text-blue-950 mb-2.5 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
            <span>3. 핵심 하락 및 리스크 요인 (Bearish Risks)</span>
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {commentary.bearFactors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2 leading-relaxed">
                <span className="text-blue-600 font-bold text-xs mt-0.5">•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 4. 향후 6개월 핵심 체크포인트 (최대 5개) */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white">
        <h3 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
          <KeyRound className="w-4 h-4 text-red-600" />
          <span>4. 향후 6개월 핵심 관찰 지표 (Key Checkpoints)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
          {commentary.keyCheckpoints.map((checkpoint, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-50 border border-slate-100">
              <span className="font-bold text-red-600 text-xs shrink-0 font-tabular">0{i + 1}.</span>
              <span className="leading-snug">{checkpoint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
