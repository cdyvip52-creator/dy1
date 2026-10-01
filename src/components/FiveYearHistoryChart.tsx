import React, { useState, useMemo } from 'react';
import { FiveYearMacroDataPoint, SavedOutlook } from '../types/market';
import { MarketDataService } from '../services/marketDataService';
import { FlowDataService } from '../services/flowDataService';
import {
  TrendingUp,
  Percent,
  CircleDollarSign,
  Landmark,
  Eye,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  Sliders,
} from 'lucide-react';

interface FiveYearHistoryChartProps {
  outlooks: SavedOutlook[];
  onSelectOutlook?: (outlook: SavedOutlook) => void;
}

type Timeframe = '1Y' | '3Y' | '5Y';

export const FiveYearHistoryChart: React.FC<FiveYearHistoryChartProps> = ({
  outlooks,
  onSelectOutlook,
}) => {
  const fullData = useMemo(() => MarketDataService.getFiveYearHistorical(), []);

  // UI States
  const [timeframe, setTimeframe] = useState<Timeframe>('5Y');
  const [showPer, setShowPer] = useState<boolean>(true);
  const [showUs10Y, setShowUs10Y] = useState<boolean>(true);
  const [showUsdKrw, setShowUsdKrw] = useState<boolean>(false);
  const [selectedForecastId, setSelectedForecastId] = useState<string>(
    outlooks.length > 0 ? outlooks[0].id : ''
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter data based on timeframe
  const filteredData = useMemo(() => {
    if (timeframe === '1Y') return fullData.slice(-12);
    if (timeframe === '3Y') return fullData.slice(-36);
    return fullData; // 5Y
  }, [fullData, timeframe]);

  // Find active selected forecast for overlay
  const selectedForecast = useMemo(() => {
    return outlooks.find((o) => o.id === selectedForecastId) || null;
  }, [outlooks, selectedForecastId]);

  // Chart Dimensions
  const width = 940;
  const height = 420;
  const padding = { top: 40, right: 65, bottom: 50, left: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Domain Ranges
  // 1. KOSPI Range (Left Y-Axis)
  const kospiVals = filteredData.map((d) => d.kospi);
  const minKospi = Math.min(...kospiVals, 2100);
  const maxKospi = Math.max(...kospiVals, 3600);
  const yKospiMin = Math.floor(minKospi / 100) * 100 - 50;
  const yKospiMax = Math.ceil(maxKospi / 100) * 100 + 50;

  // 2. PER Range (Right Axis 1: 7.5x ~ 13.0x)
  const yPerMin = 7.5;
  const yPerMax = 13.0;

  // 3. US 10Y Yield Range (Right Axis 2: 1.0% ~ 5.2%)
  const yYieldMin = 1.0;
  const yYieldMax = 5.2;

  // 4. USD/KRW Range (Right Axis 3: 1150 ~ 1480원)
  const yFxMin = 1150;
  const yFxMax = 1480;

  // Coordinate mappers
  const getX = (idx: number) => padding.left + (idx / (filteredData.length - 1)) * innerWidth;
  const getYKospi = (val: number) =>
    padding.top + innerHeight - ((val - yKospiMin) / (yKospiMax - yKospiMin)) * innerHeight;
  const getYPer = (val: number) =>
    padding.top + innerHeight - ((val - yPerMin) / (yPerMax - yPerMin)) * innerHeight;
  const getYYield = (val: number) =>
    padding.top + innerHeight - ((val - yYieldMin) / (yYieldMax - yYieldMin)) * innerHeight;
  const getYFx = (val: number) =>
    padding.top + innerHeight - ((val - yFxMin) / (yFxMax - yFxMin)) * innerHeight;

  // Generate SVG path strings
  const makePath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  };

  const kospiPoints = filteredData.map((d, i) => ({ x: getX(i), y: getYKospi(d.kospi) }));
  const perPoints = filteredData.map((d, i) => ({ x: getX(i), y: getYPer(d.fwdPer) }));
  const yieldPoints = filteredData.map((d, i) => ({ x: getX(i), y: getYYield(d.us10Y) }));
  const fxPoints = filteredData.map((d, i) => ({ x: getX(i), y: getYFx(d.usdKrw) }));

  // Horizontal Grid Lines (5 steps)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = yKospiMin + ((yKospiMax - yKospiMin) / 4) * i;
    return { val: Math.round(val), y: getYKospi(val) };
  });

  // Calculate Forecast Overlay Geometry
  const forecastOverlay = useMemo(() => {
    if (!selectedForecast) return null;

    // Find index of start date in filteredData
    const startDate = selectedForecast.createdAt.slice(0, 7); // 'YYYY.MM'
    const startIdx = filteredData.findIndex((d) => d.date === startDate);
    if (startIdx === -1) return null; // Start point not in current timeframe window

    const startX = getX(startIdx);
    const startY = getYKospi(selectedForecast.currentKospi);

    // 6-month target point (6 months after start date)
    const targetIdx = Math.min(startIdx + 6, filteredData.length - 1);
    const targetX = getX(targetIdx);
    const targetY = getYKospi(selectedForecast.baseTarget);
    const bullY = getYKospi(selectedForecast.bullTarget);
    const bearY = getYKospi(selectedForecast.bearTarget);

    // Actual KOSPI at that point if verified or available
    const actualKospi =
      selectedForecast.actualOutcome?.actualKospi || filteredData[targetIdx]?.kospi || null;
    const actualY = actualKospi ? getYKospi(actualKospi) : null;

    return {
      startIdx,
      startDate,
      startX,
      startY,
      targetIdx,
      targetX,
      targetY,
      bullY,
      bearY,
      actualKospi,
      actualY,
      errorPoints: selectedForecast.actualOutcome?.errorPoints,
      errorPercent: selectedForecast.actualOutcome?.errorPercent,
      targetDate: filteredData[targetIdx]?.date || '6개월 후',
    };
  }, [selectedForecast, filteredData]);

  // Hovered item data
  const hoveredItem = hoveredIndex !== null ? filteredData[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
      {/* Top Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              KOSPI 5개년 장기 추이 및 핵심 변수·과거 전망 오버레이
            </h2>
            <span className="text-[11px] bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 font-semibold">
              Multi-Variable Overlay
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            KOSPI 지수와 PER, 금리, 환율의 5개년 상관관계를 조망하고, 과거 저장된 6개월 전망의 성패를 차트 위에서 사후 검증합니다.
          </p>
        </div>

        {/* Timeframe & Overlay Series Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {(['1Y', '3Y', '5Y'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf === '1Y' ? '최근 1년' : tf === '3Y' ? '최근 3년' : '5년 전체'}
              </button>
            ))}
          </div>

          {/* Key Variable Overlay Toggles */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setShowPer(!showPer)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                showPer
                  ? 'bg-purple-50 text-purple-900 border-purple-300 font-bold'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
              }`}
              title="KOSPI 12개월 Forward PER (배)"
            >
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>12M Fwd PER</span>
            </button>

            <button
              onClick={() => setShowUs10Y(!showUs10Y)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                showUs10Y
                  ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
              }`}
              title="미국 10년물 국채금리 (%)"
            >
              <span className="w-2 h-2 rounded-full bg-amber-600"></span>
              <span>미 10년물 금리</span>
            </button>

            <button
              onClick={() => setShowUsdKrw(!showUsdKrw)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                showUsdKrw
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
              }`}
              title="원/달러 환율 (USD/KRW)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>USD/KRW</span>
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Selector Bar for Visual Post-Mortem Overlay */}
      <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-bold text-slate-800">과거 전망 사후검증 오버레이 선택:</span>
          <select
            value={selectedForecastId}
            onChange={(e) => setSelectedForecastId(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-medium text-slate-800 text-xs focus:outline-red-500 shadow-2xs"
          >
            <option value="">-- 오버레이 해제 --</option>
            {outlooks.map((o) => (
              <option key={o.id} value={o.id}>
                [{o.createdAt}] {o.title} (목표: {o.baseTarget}pt
                {o.isVerified ? ` · 실제: ${o.actualOutcome?.actualKospi}pt` : ''})
              </option>
            ))}
          </select>
        </div>

        {selectedForecast && (
          <div className="flex items-center gap-3 text-slate-600 text-[11px]">
            <span>
              당시 기준: <strong className="text-slate-900 font-tabular">{selectedForecast.currentKospi}pt</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              6M 기준목표: <strong className="text-red-700 font-tabular">{selectedForecast.baseTarget}pt</strong>
            </span>
            {selectedForecast.isVerified && selectedForecast.actualOutcome && (
              <>
                <span className="text-slate-300">|</span>
                <span>
                  실제 실현치:{' '}
                  <strong className="text-slate-900 font-tabular">
                    {selectedForecast.actualOutcome.actualKospi}pt
                  </strong>
                </span>
                <span
                  className={`font-bold font-tabular px-1.5 py-0.5 rounded ${
                    Math.abs(selectedForecast.actualOutcome.errorPercent) <= 3
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  오차 {selectedForecast.actualOutcome.errorPercent}%
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* SVG Interactive Multi-Series Chart */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ maxHeight: '440px' }}
        >
          <defs>
            {/* KOSPI Area Gradient */}
            <linearGradient id="kospi5YGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.00" />
            </linearGradient>

            {/* Forecast Projection Corridor */}
            <linearGradient id="forecastCorridorGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid Lines & Left Axis (KOSPI) */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={width - padding.right}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeDasharray="2 3"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="text-[11px] fill-slate-500 font-tabular font-medium"
              >
                {tick.val.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Right Axis Labels (PER & Yield) */}
          {showPer && (
            <g>
              <text
                x={width - padding.right + 12}
                y={padding.top}
                className="text-[10px] font-bold fill-purple-700"
              >
                PER(배)
              </text>
              {[8, 10, 12].map((pVal) => (
                <text
                  key={pVal}
                  x={width - padding.right + 12}
                  y={getYPer(pVal) + 4}
                  className="text-[10px] fill-purple-600 font-tabular"
                >
                  {pVal}x
                </text>
              ))}
              {/* 5-year average line for PER (10.8x) */}
              <line
                x1={padding.left}
                y1={getYPer(10.8)}
                x2={width - padding.right}
                y2={getYPer(10.8)}
                stroke="#a855f7"
                strokeDasharray="4 4"
                strokeWidth="1"
                opacity="0.4"
              />
            </g>
          )}

          {/* 1. KOSPI Area Fill */}
          <path
            d={`${makePath(kospiPoints)} L ${width - padding.right} ${height - padding.bottom} L ${
              padding.left
            } ${height - padding.bottom} Z`}
            fill="url(#kospi5YGradient)"
          />

          {/* 2. Overlaid Series Paths */}
          {/* USD/KRW (Teal/Emerald line) */}
          {showUsdKrw && (
            <path
              d={makePath(fxPoints)}
              fill="none"
              stroke="#059669"
              strokeWidth="1.8"
              strokeOpacity="0.75"
              strokeLinecap="round"
            />
          )}

          {/* US 10Y Yield (Amber line) */}
          {showUs10Y && (
            <path
              d={makePath(yieldPoints)}
              fill="none"
              stroke="#d97706"
              strokeWidth="2"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />
          )}

          {/* KOSPI Forward PER (Purple line) */}
          {showPer && (
            <path
              d={makePath(perPoints)}
              fill="none"
              stroke="#7c3aed"
              strokeWidth="2"
              strokeOpacity="0.85"
              strokeLinecap="round"
            />
          )}

          {/* 3. Main KOSPI Line (Thick Navy) */}
          <path
            d={makePath(kospiPoints)}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 4. VISUAL POST-MORTEM FORECAST OVERLAY */}
          {forecastOverlay && (
            <g>
              {/* Start Date Vertical Line */}
              <line
                x1={forecastOverlay.startX}
                y1={padding.top}
                x2={forecastOverlay.startX}
                y2={height - padding.bottom}
                stroke="#dc2626"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                x={forecastOverlay.startX}
                y={padding.top - 8}
                textAnchor="middle"
                className="text-[10px] font-bold fill-red-700"
              >
                전망 작성일 ({forecastOverlay.startDate})
              </text>

              {/* Forecast Projection Corridor / Corridor Polygon */}
              <polygon
                points={`
                  ${forecastOverlay.startX},${forecastOverlay.startY}
                  ${forecastOverlay.targetX},${forecastOverlay.bullY}
                  ${forecastOverlay.targetX},${forecastOverlay.bearY}
                `}
                fill="url(#forecastCorridorGrad)"
              />

              {/* 6-Month Projection Base Target Vector (Red Dashed Arrow) */}
              <line
                x1={forecastOverlay.startX}
                y1={forecastOverlay.startY}
                x2={forecastOverlay.targetX}
                y2={forecastOverlay.targetY}
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeDasharray="4 3"
              />

              {/* Target Marker Dot */}
              <circle
                cx={forecastOverlay.targetX}
                cy={forecastOverlay.targetY}
                r="5"
                className="fill-red-600 stroke-white stroke-2"
              />
              <text
                x={forecastOverlay.targetX + 8}
                y={forecastOverlay.targetY + 4}
                className="text-[11px] font-extrabold fill-red-950 font-tabular"
              >
                목표 {selectedForecast?.baseTarget}pt
              </text>

              {/* Start Anchor Point Dot */}
              <circle
                cx={forecastOverlay.startX}
                cy={forecastOverlay.startY}
                r="4.5"
                className="fill-red-700 stroke-white stroke-2"
              />

              {/* Actual Outcome Marker & Error Gap Vector */}
              {forecastOverlay.actualY !== null && (
                <g>
                  {/* Vertical Error Line Connector */}
                  <line
                    x1={forecastOverlay.targetX}
                    y1={forecastOverlay.targetY}
                    x2={forecastOverlay.targetX}
                    y2={forecastOverlay.actualY}
                    stroke="#e11d48"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                  {/* Actual Realization Circle */}
                  <circle
                    cx={forecastOverlay.targetX}
                    cy={forecastOverlay.actualY}
                    r="5"
                    className="fill-slate-900 stroke-white stroke-2"
                  />
                  <text
                    x={forecastOverlay.targetX + 8}
                    y={forecastOverlay.actualY + 4}
                    className="text-[11px] font-bold fill-slate-800 font-tabular"
                  >
                    실제 {forecastOverlay.actualKospi}pt
                  </text>

                  {/* Error Callout Badge on chart */}
                  {forecastOverlay.errorPercent !== undefined && (
                    <g transform={`translate(${forecastOverlay.targetX - 70}, ${(forecastOverlay.targetY + forecastOverlay.actualY) / 2 - 12})`}>
                      <rect
                        width="60"
                        height="20"
                        rx="4"
                        fill="#0f172a"
                        opacity="0.9"
                      />
                      <text
                        x="30"
                        y="14"
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-white font-tabular"
                      >
                        오차 {forecastOverlay.errorPercent}%
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>
          )}

          {/* 5. Historical Milestone Event Badges on Bottom */}
          {filteredData.map((d, i) => {
            if (d.eventLabel) {
              const x = getX(i);
              return (
                <g key={i}>
                  <line
                    x1={x}
                    y1={height - padding.bottom}
                    x2={x}
                    y2={height - padding.bottom + 8}
                    stroke="#94a3b8"
                    strokeWidth="1"
                  />
                  <circle
                    cx={x}
                    cy={getYKospi(d.kospi)}
                    r="3.5"
                    className="fill-red-600 stroke-white stroke-1"
                  />
                </g>
              );
            }
            return null;
          })}

          {/* 6. Hover Crosshair & Invisible Hitboxes */}
          {filteredData.map((d, i) => {
            const x = getX(i);
            return (
              <g key={d.date}>
                <rect
                  x={x - (innerWidth / filteredData.length) / 2}
                  y={padding.top}
                  width={innerWidth / filteredData.length}
                  height={innerHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

          {/* Hover Crosshair Vertical Line */}
          {hoveredIndex !== null && (
            <g pointerEvents="none">
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={height - padding.bottom}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={getX(hoveredIndex)}
                cy={getYKospi(filteredData[hoveredIndex].kospi)}
                r="4.5"
                className="fill-slate-900 stroke-white stroke-2"
              />
              {showPer && (
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getYPer(filteredData[hoveredIndex].fwdPer)}
                  r="3.5"
                  className="fill-purple-600 stroke-white stroke-1.5"
                />
              )}
              {showUs10Y && (
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getYYield(filteredData[hoveredIndex].us10Y)}
                  r="3.5"
                  className="fill-amber-600 stroke-white stroke-1.5"
                />
              )}
              {showUsdKrw && (
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getYFx(filteredData[hoveredIndex].usdKrw)}
                  r="3.5"
                  className="fill-emerald-600 stroke-white stroke-1.5"
                />
              )}
            </g>
          )}

          {/* X-Axis Date Labels */}
          {filteredData.map((d, i) => {
            const step = timeframe === '5Y' ? 6 : timeframe === '3Y' ? 4 : 2;
            if (i % step === 0 || i === filteredData.length - 1) {
              return (
                <text
                  key={d.date}
                  x={getX(i)}
                  y={height - padding.bottom + 22}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-tabular"
                >
                  {d.date}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Floating Tooltip Box */}
        {hoveredItem && hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-xs text-white p-3 rounded-lg text-xs shadow-xl space-y-1.5 border border-slate-700 min-w-44"
            style={{
              left: `${Math.min(78, Math.max(22, (getX(hoveredIndex) / width) * 100))}%`,
              top: '15px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-700 pb-1">
              <span className="font-bold text-slate-300">{hoveredItem.date}</span>
              {hoveredItem.eventLabel && (
                <span className="text-[10px] bg-red-950 text-red-200 border border-red-800 px-1.5 py-0.5 rounded">
                  {hoveredItem.eventLabel}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white"></span>
                <span>KOSPI 지수:</span>
              </span>
              <span className="font-bold text-white font-tabular">
                {hoveredItem.kospi.toLocaleString()} pt
              </span>
            </div>

            {showPer && (
              <div className="flex justify-between items-center text-purple-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>12M Fwd PER:</span>
                </span>
                <span className="font-bold font-tabular">{hoveredItem.fwdPer.toFixed(1)} 배</span>
              </div>
            )}

            {showUs10Y && (
              <div className="flex justify-between items-center text-amber-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>미 10년물 금리:</span>
                </span>
                <span className="font-bold font-tabular">{hoveredItem.us10Y.toFixed(2)} %</span>
              </div>
            )}

            {showUsdKrw && (
              <div className="flex justify-between items-center text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>원/달러 환율:</span>
                </span>
                <span className="font-bold font-tabular">
                  {hoveredItem.usdKrw.toLocaleString()} 원
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* VISUAL POST-MORTEM ANALYSIS CARD (When forecast is selected) */}
      {selectedForecast && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-red-100 text-red-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  선택된 전망 시각적 사후 검증 (Visual Post-Mortem Card): {selectedForecast.title}
                </h3>
                <div className="text-[11px] text-slate-500 font-tabular">
                  작성일: {selectedForecast.createdAt} · 작성자: {selectedForecast.author} · 당시 KOSPI: {selectedForecast.currentKospi}pt
                </div>
              </div>
            </div>

            {onSelectOutlook && (
              <button
                onClick={() => onSelectOutlook(selectedForecast)}
                className="text-xs font-semibold text-red-700 hover:text-red-900 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>상세 기록 열람</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Metric Comparison Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400">당시 6M 기준 목표</div>
              <div className="text-sm font-bold text-red-950 mt-0.5 font-tabular">
                {selectedForecast.baseTarget.toLocaleString()} pt
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-tabular">
                PER {selectedForecast.assumptions.basePer}배
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400">6개월 후 실제 KOSPI</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5 font-tabular">
                {selectedForecast.actualOutcome ? `${selectedForecast.actualOutcome.actualKospi.toLocaleString()} pt` : '추적 진행 중'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-tabular">
                {selectedForecast.actualOutcome ? `PER ${selectedForecast.actualOutcome.actualPer}배` : '-'}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400">예측 괴리 / 오차율</div>
              <div
                className={`text-sm font-bold mt-0.5 font-tabular ${
                  selectedForecast.actualOutcome &&
                  Math.abs(selectedForecast.actualOutcome.errorPercent) <= 3
                    ? 'text-emerald-700'
                    : 'text-amber-700'
                }`}
              >
                {selectedForecast.actualOutcome
                  ? `${selectedForecast.actualOutcome.errorPoints >= 0 ? '+' : ''}${selectedForecast.actualOutcome.errorPoints}pt (${selectedForecast.actualOutcome.errorPercent}%)`
                  : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {selectedForecast.actualOutcome && Math.abs(selectedForecast.actualOutcome.errorPercent) <= 3
                  ? '정밀 적중'
                  : '정상 범위'}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400">예상 vs 실제 EPS</div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5 font-tabular">
                {selectedForecast.assumptions.expectedEps}원 vs{' '}
                {selectedForecast.actualOutcome?.actualEps || '-'}원
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {selectedForecast.actualOutcome
                  ? `괴리율 ${(((selectedForecast.actualOutcome.actualEps - selectedForecast.assumptions.expectedEps) / selectedForecast.assumptions.expectedEps) * 100).toFixed(1)}%`
                  : '-'}
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400">당시 매크로 환경</div>
              <div className="text-xs font-semibold text-slate-800 mt-0.5 font-tabular">
                금리 {selectedForecast.assumptions.us10Y}%
              </div>
              <div className="text-[10px] text-slate-500 font-tabular mt-0.5">
                환율 {selectedForecast.assumptions.usdKrw}원
              </div>
            </div>
          </div>

          {/* Post-Mortem Insight Comment */}
          {selectedForecast.actualOutcome && (
            <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">
                🔍 사후 오차 원인 분석 (Post-Mortem Findings):
              </span>
              {selectedForecast.actualOutcome.postMortemNotes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
