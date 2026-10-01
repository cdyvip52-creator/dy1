import {
  OutlookAssumptions,
  ScenarioDetail,
  VariableFactorEvaluation,
  AutomatedCommentary,
} from '../types/market';
import { FlowDataService } from './flowDataService';

interface ExportDataParams {
  currentKospi: number;
  currentChange?: number;
  currentChangePercent?: number;
  assumptions: OutlookAssumptions;
  scenarios: {
    bull: ScenarioDetail;
    base: ScenarioDetail;
    bear: ScenarioDetail;
  };
  factors: VariableFactorEvaluation[];
  commentary: AutomatedCommentary;
  currentPer?: number;
}

/**
 * Escapes CSV field value according to RFC 4180
 */
function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // If string contains comma, double quote, or newline, wrap in quotes and double internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates structured CSV content formatted for research work and Excel compatibility
 */
export function generateScenarioCSV(params: ExportDataParams): string {
  const {
    currentKospi,
    currentChange = 22.8,
    currentChangePercent = 0.65,
    assumptions,
    scenarios,
    factors,
    commentary,
    currentPer = 10.2,
  } = params;

  const now = new Date();
  const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const rows: string[][] = [];

  // Title Block
  rows.push(['[KOSPI Outlook] KOSPI 6개월 전망 및 시나리오 분석 데이터']);
  rows.push(['생성일시', dateFormatted]);
  rows.push(['기준 KOSPI 지수', `${currentKospi} pt`, `전일대비 ${currentChange > 0 ? '+' : ''}${currentChange} pt (${currentChangePercent > 0 ? '+' : ''}${currentChangePercent}%)`]);
  rows.push(['현재 12M Fwd PER', `${currentPer} 배`]);
  rows.push(['분석 공식', 'KOSPI 적정지수 = 예상 12M Fwd EPS × 적용 PER']);
  rows.push([]); // empty line

  // SECTION 1: 3대 시나리오 전망 (Bull, Base, Bear)
  rows.push(['=== 1. KOSPI 6개월 시나리오별 목표치 및 조건 ===']);
  rows.push([
    '시나리오',
    '목표 지수 (pt)',
    '현재대비 예상 수익률 (%)',
    '예상 12M Fwd EPS (원)',
    '적용 PER (배)',
    '시나리오 성립 조건',
    '주요 리스크 요인',
  ]);

  const scenarioList = [scenarios.bull, scenarios.base, scenarios.bear];
  scenarioList.forEach((s) => {
    rows.push([
      s.name,
      String(s.targetKospi),
      `${s.returnPercent > 0 ? '+' : ''}${s.returnPercent}%`,
      String(s.expectedEps),
      String(s.appliedPer),
      s.conditions.join('; '),
      s.keyRisks.join('; '),
    ]);
  });
  rows.push([]);

  // SECTION 2: 사용자 분석 가정 및 매크로 변수 설정값
  rows.push(['=== 2. 사용자 전망 가정 및 핵심 매크로 변수 ===']);
  rows.push(['변수명', '설정값', '단위', '상세 설명']);
  rows.push(['KOSPI 예상 12M Fwd EPS', String(assumptions.expectedEps), '원', '향후 12개월 KOSPI 상장사 주당순이익 환산치']);
  rows.push(['연간 EPS 예상 성장률', String(assumptions.epsGrowthRate), '%', '컨센서스 및 사용자 추정치 반영']);
  rows.push(['강세 시나리오 적용 PER', String(assumptions.bullPer), '배', '기업이익 서프라이즈 및 멀티플 확장 시']);
  rows.push(['기준 시나리오 적용 PER', String(assumptions.basePer), '배', '역사적 평균 밸류에이션(10~11배) 수준']);
  rows.push(['약세 시나리오 적용 PER', String(assumptions.bearPer), '배', '실적 둔화 및 긴축 재개 시 멀티플 디레이팅']);
  rows.push(['미국 국채 10년물 금리', String(assumptions.us10Y), '%', '글로벌 할인율 및 증시 밸류에이션 벤치마크']);
  rows.push(['원/달러 환율 (USD/KRW)', String(assumptions.usdKrw), '원', '환차손익 및 수출 채산성 영향']);
  rows.push(['WTI 원유 가격', String(assumptions.wti), '$/배럴', '원가 부담 및 인플레이션 압력']);
  rows.push(['외국인 20거래일 순매수', FlowDataService.formatMoney(assumptions.foreignFlow20D), '원', '수급 모멘텀 및 환율 연동 매수세']);
  rows.push([]);

  // SECTION 3: 8대 거시 및 시장 변수 정밀 평가
  rows.push(['=== 3. 8대 거시·시장 변수 정밀 평가 (Scorecard) ===']);
  rows.push(['변수 항목', '평가 단계', '영향도 가중치', '평가 요약', '세부 근거']);
  factors.forEach((f) => {
    rows.push([
      f.name,
      f.scoreLabel,
      f.impactWeight,
      f.summary,
      f.detail,
    ]);
  });
  rows.push([]);

  // SECTION 4: 자동 분석 리서치 코멘터리
  rows.push(['=== 4. 자동 생성 리서치 코멘터리 (Research Digest) ===']);
  rows.push(['핵심 관찰 질문', '향후 6개월 KOSPI 방향을 결정할 가장 중요한 변수는 무엇인가?']);
  rows.push(['질문에 대한 분석 결론', commentary.primaryDriverAnswer]);
  rows.push([]);

  rows.push(['[시장 종합 판단 (Summary)]']);
  commentary.overallJudgement.forEach((line, i) => {
    rows.push([`문장 ${i + 1}`, line]);
  });
  rows.push([]);

  rows.push(['[핵심 상승 요인 (Bull Drivers)]']);
  commentary.bullFactors.forEach((factor, i) => {
    rows.push([`상승 요인 ${i + 1}`, factor]);
  });
  rows.push([]);

  rows.push(['[핵심 하락 요인 (Bear Risks)]']);
  commentary.bearFactors.forEach((risk, i) => {
    rows.push([`하락 리스크 ${i + 1}`, risk]);
  });
  rows.push([]);

  rows.push(['[향후 6개월 투자 관찰 포인트 (Checkpoints)]']);
  commentary.keyCheckpoints.forEach((cp, i) => {
    rows.push([`체크포인트 ${i + 1}`, cp]);
  });

  return rows.map((r) => r.map(escapeCsv).join(',')).join('\r\n');
}

/**
 * Triggers browser download of CSV file with UTF-8 BOM for Microsoft Excel compatibility
 */
export function downloadScenarioCSV(params: ExportDataParams, customFilename?: string): boolean {
  try {
    const csvString = generateScenarioCSV(params);

    // Prepend UTF-8 BOM so Excel opens Korean text without encoding corruption
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvString], { type: 'text/csv;charset=utf-8;' });

    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    const filename = customFilename || `KOSPI_6M_전망_분석데이터_${dateStr}.csv`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return false;
  }
}

export const CsvExportService = {
  generateScenarioCSV,
  downloadScenarioCSV,
};
