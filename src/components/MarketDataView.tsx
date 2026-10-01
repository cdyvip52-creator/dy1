import React, { useState } from 'react';
import { MarketDataService } from '../services/marketDataService';
import { EarningsDataService } from '../services/earningsDataService';
import { ValuationService } from '../services/valuationService';
import { MacroDataService } from '../services/macroDataService';
import { FlowDataService } from '../services/flowDataService';
import { Layers, ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from 'lucide-react';

export const MarketDataView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const indices = MarketDataService.getIndices();
  const earnings = EarningsDataService.getEarnings();
  const valuation = ValuationService.getValuation();
  const rates = MacroDataService.getRates();
  const fx = MacroDataService.getFx();
  const commodities = MacroDataService.getCommodities();
  const flows = FlowDataService.getFlows();
  const macro = MacroDataService.getMacro();

  const categories = [
    { id: 'all', label: '전체 보기 (A~H)' },
    { id: 'indices', label: 'A. 주요 지수' },
    { id: 'earnings', label: 'B. 기업이익 (삼성전자·SK하이닉스)' },
    { id: 'valuation', label: 'C. 밸류에이션' },
    { id: 'rates', label: 'D. 금리' },
    { id: 'fx', label: 'E. 환율' },
    { id: 'commodities', label: 'F. 원자재' },
    { id: 'flows', label: 'G. 시장 수급' },
    { id: 'macro', label: 'H. 경기·심리' },
  ];

  return (
    <div className="space-y-6">
      {/* Category selector */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">수집 및 관리 시장 데이터 (A~H 카테고리)</h2>
          </div>
          <span className="text-xs text-slate-500">기준일자: 2026.09.30 (데모 시뮬레이션)</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-red-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* A. 지수 */}
      {(activeCategory === 'all' || activeCategory === 'indices') && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              A. 국내외 주요 지수 (1일/1주/1개월/3개월 변화율)
            </h3>
            <span className="text-[11px] text-slate-400">글로벌 반도체 포함</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">지수명</th>
                  <th className="py-2.5 px-3 font-semibold">티커</th>
                  <th className="py-2.5 px-3 font-semibold text-right">현재가</th>
                  <th className="py-2.5 px-3 font-semibold text-right">전일 대비</th>
                  <th className="py-2.5 px-3 font-semibold text-right">1주 (%)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">1개월 (%)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">3개월 (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {indices.map((idx) => {
                  const isUp = idx.change >= 0;
                  return (
                    <tr key={idx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{idx.name}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">{idx.symbol}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-tabular text-slate-900">
                        {idx.current.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold font-tabular ${
                          isUp ? 'text-red-600' : 'text-blue-600'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {idx.change.toFixed(2)} ({isUp ? '+' : ''}
                        {idx.changePercent}%)
                      </td>
                      <td className={`py-2.5 px-3 text-right font-tabular ${idx.change1W >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {idx.change1W >= 0 ? '+' : ''}
                        {idx.change1W}%
                      </td>
                      <td className={`py-2.5 px-3 text-right font-tabular ${idx.change1M >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {idx.change1M >= 0 ? '+' : ''}
                        {idx.change1M}%
                      </td>
                      <td className={`py-2.5 px-3 text-right font-tabular font-bold ${idx.change3M >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {idx.change3M >= 0 ? '+' : ''}
                        {idx.change3M}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* B. 기업이익 (삼성전자·SK하이닉스 포함) */}
      {(activeCategory === 'all' || activeCategory === 'earnings') && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              B. 기업이익 전망 (KOSPI & 핵심 대형 반도체주)
            </h3>
            <span className="text-[11px] text-slate-400">KOSPI 6개월 전망의 핵심 축</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">12개월 Forward EPS</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">
                {earnings.kospi12MFwdEps}원
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">성장률 +{earnings.epsGrowthRate}%</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">올해 연간 EPS 전망</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">
                {earnings.currentYearEps}원
              </div>
              <div className="text-[10px] text-slate-400 mt-1">2026년 기준 컨센서스</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">내년 연간 EPS 전망</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">
                {earnings.nextYearEps}원
              </div>
              <div className="text-[10px] text-red-600 font-semibold mt-1">YoY +15.0% 개선 예상</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">KOSPI 총 영업이익 전망</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">
                {earnings.totalOperatingProfit}조원
              </div>
              <div className="text-[10px] text-slate-400 mt-1">순이익 {earnings.totalNetProfit}조원</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700 mb-2">
              주요 반도체 및 대형주 실적 비중 & 세부 전망:
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-semibold">종목명</th>
                    <th className="py-2 px-3 font-semibold">티커</th>
                    <th className="py-2 px-3 font-semibold text-right">올해 영업익</th>
                    <th className="py-2 px-3 font-semibold text-right">내년 영업익</th>
                    <th className="py-2 px-3 font-semibold text-right">영업익 성장률</th>
                    <th className="py-2 px-3 font-semibold text-right">12M Fwd EPS</th>
                    <th className="py-2 px-3 font-semibold text-right">Fwd PER</th>
                    <th className="py-2 px-3 font-semibold text-right">KOSPI 이익 비중</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {earnings.companies.map((comp) => (
                    <tr key={comp.ticker} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{comp.name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{comp.ticker}</td>
                      <td className="py-2.5 px-3 text-right font-tabular text-slate-700">
                        {(comp.currentYearOpProfit / 10000).toFixed(1)}조원
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular font-bold text-slate-900">
                        {(comp.nextYearOpProfit / 10000).toFixed(1)}조원
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular text-emerald-700 font-semibold">
                        +{comp.opProfitGrowth}%
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular font-medium text-slate-800">
                        {comp.fwdEps.toLocaleString()}원
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular text-slate-600">
                        {comp.fwdPer.toFixed(1)}배
                      </td>
                      <td className="py-2.5 px-3 text-right font-tabular font-semibold text-red-700">
                        {comp.shareOfKospiEarnings}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* C. 밸류에이션 */}
      {(activeCategory === 'all' || activeCategory === 'valuation') && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              C. 밸류에이션 지표 및 역사적 평균 비교
            </h3>
            <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded font-semibold border border-red-200">
              현재 수준: {valuation.perLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">12M Fwd PER</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">
                {valuation.fwdPer.toFixed(2)}배
              </div>
              <div className="text-[10px] text-slate-400 mt-1">선행 주가수익비율</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">최근 5년 평균 PER</div>
              <div className="text-lg font-bold text-slate-700 mt-0.5 font-tabular">
                {valuation.fiveYearAvgPer.toFixed(2)}배
              </div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1">평균 대비 저평가</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">최근 10년 평균 PER</div>
              <div className="text-lg font-bold text-slate-700 mt-0.5 font-tabular">
                {valuation.tenYearAvgPer.toFixed(2)}배
              </div>
              <div className="text-[10px] text-slate-400 mt-1">장기 밴드 중간</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">PBR (주가순자산비율)</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">
                {valuation.pbr.toFixed(2)}배
              </div>
              <div className="text-[10px] text-red-600 font-semibold mt-1">1.0배 이하 청산가치 근접</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">자기자본이익률 (ROE)</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">
                {valuation.roe.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">두 자릿수 회복 시도</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-[11px] text-slate-500">배당수익률</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5 font-tabular">
                {valuation.dividendYield.toFixed(2)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">밸류업 주주환원 확대</div>
            </div>
          </div>
        </div>
      )}

      {/* D. 금리 & E. 환율 & F. 원자재 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* D. 금리 */}
        {(activeCategory === 'all' || activeCategory === 'rates') && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              D. 국내외 국채 및 기준금리
            </h3>
            <div className="space-y-2 text-xs">
              {rates.map((r) => (
                <div key={r.code} className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <span className="text-slate-600 font-medium">{r.name}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-tabular">{r.value.toFixed(2)}%</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-tabular">
                      ({r.change >= 0 ? '+' : ''}{r.change.toFixed(2)}%p)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* E. 환율 */}
        {(activeCategory === 'all' || activeCategory === 'fx') && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              E. 주요 환율
            </h3>
            <div className="space-y-2 text-xs">
              {fx.map((item) => (
                <div key={item.pair} className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <div>
                    <span className="text-slate-700 font-bold">{item.pair}</span>
                    <span className="text-[10px] text-slate-400 ml-1">({item.name})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-tabular">
                      {item.value.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </span>
                    <span
                      className={`text-[10px] ml-1.5 font-tabular ${
                        item.change >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {item.change >= 0 ? '+' : ''}
                      {item.changePercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* F. 원자재 */}
        {(activeCategory === 'all' || activeCategory === 'commodities') && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              F. 주요 원자재
            </h3>
            <div className="space-y-2 text-xs">
              {commodities.map((item) => (
                <div key={item.code} className="flex items-center justify-between p-2 rounded bg-slate-50">
                  <div>
                    <span className="text-slate-700 font-bold">{item.name}</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-tabular">({item.unit})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-tabular">
                      {item.value.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                    </span>
                    <span
                      className={`text-[10px] ml-1.5 font-tabular ${
                        item.change >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {item.change >= 0 ? '+' : ''}
                      {item.changePercent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* G. 수급 */}
      {(activeCategory === 'all' || activeCategory === 'flows') && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              G. KOSPI 주체별 누적 순매수 (1일 · 5일 · 20일 · 60일)
            </h3>
            <span className="text-[11px] text-slate-400">단위: 억원 / 조원</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">투자자 주체</th>
                  <th className="py-2.5 px-3 font-semibold text-right">당일 (1일)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">최근 5거래일 누적</th>
                  <th className="py-2.5 px-3 font-semibold text-right">최근 20거래일 누적</th>
                  <th className="py-2.5 px-3 font-semibold text-right">최근 60거래일 누적</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {flows.map((f) => (
                  <tr key={f.category} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{f.category}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-tabular font-medium ${
                        f.net1D >= 0 ? 'text-red-600' : 'text-blue-600'
                      }`}
                    >
                      {FlowDataService.formatMoney(f.net1D)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-tabular font-medium ${
                        f.net5D >= 0 ? 'text-red-600' : 'text-blue-600'
                      }`}
                    >
                      {FlowDataService.formatMoney(f.net5D)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-tabular font-bold ${
                        f.net20D >= 0 ? 'text-red-600' : 'text-blue-600'
                      }`}
                    >
                      {FlowDataService.formatMoney(f.net20D)}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-tabular font-bold ${
                        f.net60D >= 0 ? 'text-red-700' : 'text-blue-700'
                      }`}
                    >
                      {FlowDataService.formatMoney(f.net60D)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* H. 경기 및 심리 */}
      {(activeCategory === 'all' || activeCategory === 'macro') && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              H. 경기 및 심리 지표 모니터 (수출·물가·제조업·VIX)
            </h3>
            <span className="text-[11px] text-slate-400">거시 펀더멘털 체크</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {macro.map((m, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800">{m.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    이전: {m.previous} · 발표: {m.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900 font-tabular">{m.value}</div>
                  <div
                    className={`text-[10px] font-semibold ${
                      m.impactOnKospi === '긍정적'
                        ? 'text-emerald-700'
                        : m.impactOnKospi === '부정적'
                        ? 'text-rose-700'
                        : 'text-slate-500'
                    }`}
                  >
                    KOSPI {m.impactOnKospi}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
