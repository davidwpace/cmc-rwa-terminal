import { RWASpreadItem } from './types';

export const TRADFI_BENCHMARKS = {
  XAU: { name: 'Spot Gold (Oz)', price: 2650.0 },
  UST_NAV: { name: 'US Treasury Par ($)', price: 1.0 },
  AAPL: { name: 'Apple Inc. (Spot)', price: 228.2 },
};

type QuoteMap = Record<
  string,
  {
    quote?: {
      USD?: {
        price?: number;
      };
    };
  }
>;

export function calculateArbitrageSpreads(cmcData: QuoteMap): RWASpreadItem[] {
  const assets = [
    {
      id: 'paxg',
      symbol: 'PAXG',
      name: 'Paxos Gold',
      issuer: 'Paxos Trust',
      category: 'Commodities' as const,
      benchmark: TRADFI_BENCHMARKS.XAU,
      price: cmcData?.PAXG?.quote?.USD?.price,
    },
    {
      id: 'xaut',
      symbol: 'XAUT',
      name: 'Tether Gold',
      issuer: 'Tether Holdings',
      category: 'Commodities' as const,
      benchmark: TRADFI_BENCHMARKS.XAU,
      price: cmcData?.XAUT?.quote?.USD?.price,
    },
    {
      id: 'usdy',
      symbol: 'USDY',
      name: 'Ondo US Dollar Yield',
      issuer: 'Ondo Finance',
      category: 'Treasuries' as const,
      benchmark: TRADFI_BENCHMARKS.UST_NAV,
      price: cmcData?.USDY?.quote?.USD?.price,
    },
    {
      id: 'buidl',
      symbol: 'BUIDL',
      name: 'BlackRock BUIDL',
      issuer: 'BlackRock',
      category: 'Treasuries' as const,
      benchmark: TRADFI_BENCHMARKS.UST_NAV,
      price: cmcData?.BUIDL?.quote?.USD?.price,
    },
    {
      id: 'baapl',
      symbol: 'bAAPL',
      name: 'Backed Apple',
      issuer: 'Backed Finance',
      category: 'Equities' as const,
      benchmark: TRADFI_BENCHMARKS.AAPL,
      price: cmcData?.bAAPL?.quote?.USD?.price,
    },
  ];

  return assets
    .filter(
      (
      asset
      ): asset is (typeof assets)[number] & {
      price: number;
      } => typeof asset.price === 'number' && Number.isFinite(asset.price)
    )
    .map((asset) => {
      const spreadPercent =
      ((asset.price - asset.benchmark.price) / asset.benchmark.price) * 100;
      let status: RWASpreadItem['status'] = 'PAR';
      let arbitrageSignal = 'Hold / Parity Match';

      if (spreadPercent > 0.05) {
      status = 'PREMIUM';
      arbitrageSignal = `Short On-Chain / Buy ${asset.benchmark.name}`;
      } else if (spreadPercent < -0.05) {
      status = 'DISCOUNT';
      arbitrageSignal = 'Buy On-Chain / Redeem at TradFi Benchmark';
      }

      return {
        id: asset.id,
        tokenSymbol: asset.symbol,
        tokenName: asset.name,
        issuer: asset.issuer,
        category: asset.category,
        tokenPrice: asset.price,
        benchmarkPrice: asset.benchmark.price,
        benchmarkName: asset.benchmark.name,
        spreadPercent,
        status,
        arbitrageSignal,
      };
    });
}
