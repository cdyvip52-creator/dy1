import React, { useState } from 'react';
import { HistoricalPricePoint, ScenarioDetail } from '../types/market';

interface KospiForecastChartProps {
  historicalData: HistoricalPricePoint[];
  currentKospi: number;
  scenarios: {
    bull: ScenarioDetail;
    base: ScenarioDetail;
    bear: ScenarioDetail;
  };
}

export const KospiForecastChart: React.FC<KospiForecastChartProps> = ({
  historicalData,
  currentKospi,
  scenarios,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    value: number;
    type: 'past' | 'bull' | 'base' | 'bear';
    x: number;
    y: number;
  } | null>(null);

  // Chart dimensions
  const width = 860;
  const height = 360;
  const padding = { top: 35, right: 90, bottom: 45, left: 55 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Build future 6 months dates
  // Currently 2026.09 -> Future: 2026.10, 2026.11, 2026.12, 2027.01, 2027.02, 2027.03 (6M target)
  const futureMonths = [
    '2026.10',
    '2026.11',
    '2026.12',
    '2027.01',
    '2027.02',
    '2027.03 (+6M)',
  ];

  const totalPoints = historicalData.length + futureMonths.length;
  const splitIndex = historicalData.length - 1; // Current anchor point index

  // Calculate values range
  const allValues = [
    ...historicalData.map((d) => d.close),
    currentKospi,
    scenarios.bull.targetKospi,
    scenarios.base.targetKospi,
    scenarios.bear.targetKospi,
  ];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const yMin = Math.floor((rawMin - 150) / 100) * 100;
  const yMax = Math.ceil((rawMax + 150) / 100) * 100;

  // Coordinate mappers
  const getX = (index: number) => padding.left + (index / (totalPoints - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - yMin) / (yMax - yMin)) * innerHeight;

  // Build past line coordinates
  const pastCoords = historicalData.map((d, i) => ({
    x: getX(i),
    y: getY(d.close),
    date: d.date,
    val: d.close,
  }));

  const splitX = getX(splitIndex);
  const splitY = getY(currentKospi);

  // Future trajectory interpolation from splitX, splitY to +6M
  const getFutureCoords = (targetValue: number) => {
    return futureMonths.map((month, idx) => {
      const stepFraction = (idx + 1) / futureMonths.length;
      // Slight gentle ease
      const interpolatedVal = currentKospi + (targetValue - currentKospi) * stepFraction;
      const pointIndex = splitIndex + 1 + idx;
      return {
        x: getX(pointIndex),
        y: getY(interpolatedVal),
        date: month,
        val: Math.round(interpolatedVal),
      };
    });
  };

  const bullPathPoints = [{ x: splitX, y: splitY, date: '2026.09', val: currentKospi }, ...getFutureCoords(scenarios.bull.targetKospi)];
  const basePathPoints = [{ x: splitX, y: splitY, date: '2026.09', val: currentKospi }, ...getFutureCoords(scenarios.base.targetKospi)];
  const bearPathPoints = [{ x: splitX, y: splitY, date: '2026.09', val: currentKospi }, ...getFutureCoords(scenarios.bear.targetKospi)];

  const makeSvgPath = (points: { x: number; y: number }[]) => {
    return points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  };

  // Forecast fan corridor polygon (Bull top, Bear bottom back)
  const corridorPolygon = `
    M ${splitX} ${splitY}
    ${bullPathPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')}
    ${bearPathPoints.slice(1).reverse().map((p) => `L ${p.x} ${p.y}`).join(' ')}
    Z
  `;

  // Horizontal grid lines
  const yTicksCount = 5;
  const yTicks = Array.from({ length: yTicksCount }, (_, i) => {
    const val = yMin + ((yMax - yMin) / (yTicksCount - 1)) * i;
    return { val: Math.round(val), y: getY(val) };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              KOSPI 과거 추이 및 향후 6개월 시나리오 전망 차트
            </h2>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-medium">
              12M Historical + 6M Forecast
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            과거 실적 구간(실선)과 사용자 가정이 반영된 6개월 미래 경로(점선 및 시나리오 밴드)
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <div className="w-3.5 h-0.5 bg-slate-800 rounded"></div>
            <span>과거 실제</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-700 font-medium">
            <div className="w-3.5 h-0.5 bg-red-600 border-b border-dashed border-red-600"></div>
            <span>강세 ({scenarios.bull.targetKospi.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-950 font-bold">
            <div className="w-3.5 h-0.5 bg-red-800 border-b border-dashed border-red-800"></div>
            <span>기준 ({scenarios.base.targetKospi.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-700 font-medium">
            <div className="w-3.5 h-0.5 bg-blue-600 border-b border-dashed border-blue-600"></div>
            <span>약세 ({scenarios.bear.targetKospi.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* SVG Container with responsive aspect ratio */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: '380px' }}
        >
          <defs>
            {/* Future zone gradient background */}
            <linearGradient id="futureZoneGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.01" />
            </linearGradient>

            {/* Scenario corridor gradient: Red (Bull) to Wine (Base) to Blue (Bear) */}
            <linearGradient id="corridorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#991b1b" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.12" />
            </linearGradient>

            {/* Past line area gradient */}
            <linearGradient id="pastAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid Background Lines */}
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
                className="text-[11px] fill-slate-400 font-tabular font-medium"
              >
                {tick.val.toLocaleString()}
              </text>
            </g>
          ))}

          {/* Future Zone Shading Background */}
          <rect
            x={splitX}
            y={padding.top}
            width={width - padding.right - splitX}
            height={innerHeight}
            fill="url(#futureZoneGradient)"
          />

          {/* Dividing Vertical Line between Past & Future */}
          <line
            x1={splitX}
            y1={padding.top}
            x2={splitX}
            y2={height - padding.bottom}
            stroke="#dc2626"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          <text
            x={splitX}
            y={padding.top - 12}
            textAnchor="middle"
            className="text-[11px] font-bold fill-red-700"
          >
            현재 기준일 (2026.09)
          </text>

          {/* Scenario Cone / Corridor Shaded Area */}
          <path d={corridorPolygon} fill="url(#corridorGradient)" />

          {/* Past KOSPI Area Fill */}
          <path
            d={`${makeSvgPath(pastCoords)} L ${splitX} ${height - padding.bottom} L ${padding.left} ${
              height - padding.bottom
            } Z`}
            fill="url(#pastAreaGradient)"
          />

          {/* Past KOSPI Solid Line */}
          <path
            d={makeSvgPath(pastCoords)}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Future Scenario Dashed Lines */}
          {/* 1. Bull (강세 - 빨간색) */}
          <path
            d={makeSvgPath(bullPathPoints)}
            fill="none"
            stroke="#dc2626"
            strokeWidth="2.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* 2. Base (기준 - 크림슨 레드) */}
          <path
            d={makeSvgPath(basePathPoints)}
            fill="none"
            stroke="#991b1b"
            strokeWidth="2.5"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* 3. Bear (약세 - 파란색) */}
          <path
            d={makeSvgPath(bearPathPoints)}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />

          {/* Target End Point Dots & Callout Labels */}
          {/* Bull End (Red) */}
          <circle
            cx={bullPathPoints[bullPathPoints.length - 1].x}
            cy={bullPathPoints[bullPathPoints.length - 1].y}
            r="4.5"
            className="fill-red-600 stroke-white stroke-2"
          />
          <text
            x={bullPathPoints[bullPathPoints.length - 1].x + 8}
            y={bullPathPoints[bullPathPoints.length - 1].y + 4}
            className="text-[11px] font-bold fill-red-800 font-tabular"
          >
            강세 {scenarios.bull.targetKospi.toLocaleString()}
          </text>

          {/* Base End (Crimson) */}
          <circle
            cx={basePathPoints[basePathPoints.length - 1].x}
            cy={basePathPoints[basePathPoints.length - 1].y}
            r="5"
            className="fill-red-800 stroke-white stroke-2"
          />
          <text
            x={basePathPoints[basePathPoints.length - 1].x + 8}
            y={basePathPoints[basePathPoints.length - 1].y + 4}
            className="text-[11px] font-bold fill-red-950 font-tabular"
          >
            기준 {scenarios.base.targetKospi.toLocaleString()}
          </text>

          {/* Bear End (Blue) */}
          <circle
            cx={bearPathPoints[bearPathPoints.length - 1].x}
            cy={bearPathPoints[bearPathPoints.length - 1].y}
            r="4.5"
            className="fill-blue-600 stroke-white stroke-2"
          />
          <text
            x={bearPathPoints[bearPathPoints.length - 1].x + 8}
            y={bearPathPoints[bearPathPoints.length - 1].y + 4}
            className="text-[11px] font-bold fill-blue-800 font-tabular"
          >
            약세 {scenarios.bear.targetKospi.toLocaleString()}
          </text>

          {/* Current Index Anchor Dot */}
          <circle
            cx={splitX}
            cy={splitY}
            r="5.5"
            className="fill-slate-900 stroke-white stroke-2"
          />

          {/* Past Data Hover Circles & Invisible Trigger Hitboxes */}
          {pastCoords.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="3"
                className="fill-slate-700 opacity-60 hover:opacity-100"
              />
              <rect
                x={pt.x - 15}
                y={padding.top}
                width="30"
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    date: pt.date,
                    value: pt.val,
                    type: 'past',
                    x: pt.x,
                    y: pt.y,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}

          {/* Future Data Points Hover Hitboxes */}
          {futureMonths.map((month, idx) => {
            const pointIdx = splitIndex + 1 + idx;
            const x = getX(pointIdx);
            const basePt = basePathPoints[idx + 1];
            return (
              <rect
                key={month}
                x={x - 15}
                y={padding.top}
                width="30"
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    date: month,
                    value: basePt.val,
                    type: 'base',
                    x: basePt.x,
                    y: basePt.y,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* X Axis Labels */}
          {historicalData.map((d, i) => {
            // Show every 2nd or key labels to avoid crowding
            if (i % 2 === 0 || i === historicalData.length - 1) {
              return (
                <text
                  key={d.date}
                  x={getX(i)}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 font-tabular"
                >
                  {d.date}
                </text>
              );
            }
            return null;
          })}

          {futureMonths.map((m, idx) => {
            if (idx === 1 || idx === futureMonths.length - 1) {
              return (
                <text
                  key={m}
                  x={getX(splitIndex + 1 + idx)}
                  y={height - padding.bottom + 20}
                  textAnchor="middle"
                  className="text-[10px] fill-indigo-700 font-semibold font-tabular"
                >
                  {m}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white px-3 py-2 rounded-lg text-xs shadow-lg"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 45}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-semibold text-slate-300">{hoveredPoint.date}</div>
            <div className="text-sm font-bold font-tabular text-emerald-400">
              {hoveredPoint.value.toLocaleString()} pt
            </div>
            <div className="text-[10px] text-slate-400">
              {hoveredPoint.type === 'past' ? '실제 KOSPI 지수' : '6개월 시나리오 기준'}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">6개월 목표 밴드:</span>
          <span className="font-tabular font-bold text-blue-600">{scenarios.bear.targetKospi.toLocaleString()} pt (약세)</span>
          <span>~</span>
          <span className="font-tabular font-extrabold text-red-900">{scenarios.base.targetKospi.toLocaleString()} pt (기준)</span>
          <span>~</span>
          <span className="font-tabular font-bold text-red-600">{scenarios.bull.targetKospi.toLocaleString()} pt (강세)</span>
        </div>
        <div className="text-slate-400">
          산출 공식: 예상 EPS ({scenarios.base.expectedEps}원) × 적용 PER ({scenarios.base.appliedPer}배)
        </div>
      </div>
    </div>
  );
};
