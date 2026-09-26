import { describe, expect, it } from 'vitest';

import { TRADFI_BENCHMARKS, calculateArbitrageSpreads } from './rwa-calc';

describe('calculateArbitrageSpreads', () => {
  it('marks positive spreads as PREMIUM with a short signal', () => {
    const spreads = calculateArbitrageSpreads({
      PAXG: { quote: { USD: { price: 2700 } } },
    });

    const paxg = spreads.find((spread) => spread.tokenSymbol === 'PAXG');

    expect(paxg?.status).toBe('PREMIUM');
    expect(paxg?.arbitrageSignal).toContain('Short On-Chain');
    expect(paxg?.spreadPercent).toBeGreaterThan(0.05);
  });

  it('marks negative spreads as DISCOUNT with a redeem signal', () => {
    const spreads = calculateArbitrageSpreads({
      XAUT: { quote: { USD: { price: 2600 } } },
    });

    const xaut = spreads.find((spread) => spread.tokenSymbol === 'XAUT');

    expect(xaut?.status).toBe('DISCOUNT');
    expect(xaut?.arbitrageSignal).toContain('Redeem at TradFi Benchmark');
    expect(xaut?.spreadPercent).toBeLessThan(-0.05);
  });

  it('keeps boundary threshold spreads at PAR', () => {
    const parityHigh = TRADFI_BENCHMARKS.XAU.price * 1.0005;
    const parityLow = TRADFI_BENCHMARKS.UST_NAV.price * 0.9995;
    const spreads = calculateArbitrageSpreads({
      PAXG: { quote: { USD: { price: parityHigh } } },
      USDY: { quote: { USD: { price: parityLow } } },
    });

    const paxg = spreads.find((spread) => spread.tokenSymbol === 'PAXG');
    const usdy = spreads.find((spread) => spread.tokenSymbol === 'USDY');

    expect(paxg?.status).toBe('PAR');
    expect(usdy?.status).toBe('PAR');
  });

  it('falls back to default token prices and benchmarks when quote data is missing', () => {
    const spreads = calculateArbitrageSpreads({});
    const paxg = spreads.find((spread) => spread.tokenSymbol === 'PAXG');
    const baapl = spreads.find((spread) => spread.tokenSymbol === 'bAAPL');

    expect(spreads).toHaveLength(5);
    expect(paxg?.tokenPrice).toBe(2652.8);
    expect(paxg?.benchmarkPrice).toBe(TRADFI_BENCHMARKS.XAU.price);
    expect(baapl?.benchmarkPrice).toBe(TRADFI_BENCHMARKS.AAPL.price);
  });
});
