export interface RWASpreadItem {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  issuer: string;
  category: 'Commodities' | 'Treasuries' | 'Equities';
  tokenPrice: number;
  benchmarkPrice: number;
  benchmarkName: string;
  spreadPercent: number;
  status: 'PREMIUM' | 'DISCOUNT' | 'PAR';
  arbitrageSignal: string;
}

export interface CMCProofMeta {
  latencyMs: number;
  endpoint: string;
  status: number;
  isMock: boolean;
  timestamp?: string;
  notice?: string;
}
