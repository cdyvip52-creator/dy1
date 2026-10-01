import { FlowMetric } from '../types/market';

export const INITIAL_FLOWS: FlowMetric[] = [
  {
    category: '외국인',
    net1D: 2480, // +2,480억원
    net5D: 8950, // +8,950억원
    net20D: 24500, // +2조 4,500억원
    net60D: 78200, // +7조 8,200억원
  },
  {
    category: '기관',
    net1D: -1120,
    net5D: 3200,
    net20D: -6500,
    net60D: -28400,
  },
  {
    category: '개인',
    net1D: -1360,
    net5D: -12150,
    net20D: -18000,
    net60D: -49800,
  },
];

export class FlowDataService {
  static getFlows(): FlowMetric[] {
    return INITIAL_FLOWS;
  }

  static formatMoney(valueInHundredMillion: number): string {
    const isNegative = valueInHundredMillion < 0;
    const absVal = Math.abs(valueInHundredMillion);
    const sign = isNegative ? '-' : '+';

    if (absVal >= 10000) {
      const jo = Math.floor(absVal / 10000);
      const eog = absVal % 10000;
      if (eog === 0) {
        return `${sign}${jo.toLocaleString()}조원`;
      }
      return `${sign}${jo}조 ${Math.round(eog).toLocaleString()}억원`;
    }
    return `${sign}${Math.round(absVal).toLocaleString()}억원`;
  }
}
