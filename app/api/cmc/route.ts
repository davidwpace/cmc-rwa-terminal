import { NextRequest, NextResponse } from 'next/server';

import type { RWAIssuerItem } from '@/lib/types';

const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com';
const CMC_BASE_ORIGIN = new URL(CMC_BASE_URL).origin;
const QUOTES_ENDPOINT = '/v1/cryptocurrency/quotes/latest';
const ISSUERS_ENDPOINTS = new Set([
  '/v1/real-world-assets/issuers',
  '/v5/real-world-assets/issuers/list',
]);
const ALLOWED_ENDPOINTS = new Set([QUOTES_ENDPOINT, ...ISSUERS_ENDPOINTS]);

const MOCK_QUOTES = {
  PAXG: {
    name: 'Paxos Gold',
    symbol: 'PAXG',
    quote: { USD: { price: 2652.8, percent_change_24h: 0.42 } },
  },
  XAUT: {
    name: 'Tether Gold',
    symbol: 'XAUT',
    quote: { USD: { price: 2649.1, percent_change_24h: 0.38 } },
  },
  USDY: {
    name: 'Ondo US Dollar Yield',
    symbol: 'USDY',
    quote: { USD: { price: 1.054, percent_change_24h: 0.02 } },
  },
  BUIDL: {
    name: 'BlackRock USD Institutional Digital Liquidity Fund',
    symbol: 'BUIDL',
    quote: { USD: { price: 1, percent_change_24h: 0 } },
  },
  bAAPL: {
    name: 'Backed Apple',
    symbol: 'bAAPL',
    quote: { USD: { price: 227.85, percent_change_24h: -0.15 } },
  },
} as const;

const MOCK_ISSUERS: RWAIssuerItem[] = [
  {
    id: 'ondo-finance',
    name: 'Ondo Finance',
    category: 'Treasuries',
    audited: true,
    backingStatus: 'Attested treasuries and cash equivalents',
    aumUsd: 620000000,
    tokens: [
      {
        symbol: 'USDY',
        name: 'Ondo US Dollar Yield',
        category: 'Treasuries',
      },
    ],
  },
  {
    id: 'paxos-trust',
    name: 'Paxos Trust',
    category: 'Gold',
    audited: true,
    backingStatus: 'Allocated London Good Delivery gold bars',
    aumUsd: 540000000,
    tokens: [
      {
        symbol: 'PAXG',
        name: 'Paxos Gold',
        category: 'Gold',
      },
    ],
  },
  {
    id: 'tether',
    name: 'Tether',
    category: 'Gold',
    audited: true,
    backingStatus: 'Physical gold reserve attestations',
    aumUsd: 590000000,
    tokens: [
      {
        symbol: 'XAUT',
        name: 'Tether Gold',
        category: 'Gold',
      },
    ],
  },
  {
    id: 'backed-finance',
    name: 'Backed Finance',
    category: 'Equities',
    audited: true,
    backingStatus: 'Segregated custody with periodic verification',
    aumUsd: 95000000,
    tokens: [
      {
        symbol: 'bAAPL',
        name: 'Backed Apple',
        category: 'Equities',
      },
    ],
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Endpoint query parameter required' },
      { status: 400 }
    );
  }

  let parsedEndpoint: URL;

  try {
    parsedEndpoint = new URL(endpoint, CMC_BASE_URL);
  } catch {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }

  if (
    parsedEndpoint.origin !== CMC_BASE_ORIGIN ||
    !ALLOWED_ENDPOINTS.has(parsedEndpoint.pathname)
  ) {
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }

  const apiKey = process.env.CMC_PRO_API_KEY;
  const mergedParams = new URLSearchParams(parsedEndpoint.searchParams);

  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      mergedParams.append(key, value);
    }
  });

  const targetUrl = new URL(parsedEndpoint.pathname, CMC_BASE_URL);
  targetUrl.search = mergedParams.toString();
  const effectiveEndpoint = `${targetUrl.pathname}${targetUrl.search}`;
  const startTime = Date.now();

  if (!apiKey) {
    const mockResponse = getMockData(targetUrl);

    if ('error' in mockResponse) {
      return NextResponse.json(
        {
          error: mockResponse.error,
          meta: {
            latencyMs: 14,
            endpoint: effectiveEndpoint,
            status: 400,
            isMock: true,
            notice: 'No CMC_PRO_API_KEY set. Showing deterministic mock response.',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      meta: {
        latencyMs: 14,
        endpoint: effectiveEndpoint,
        status: 200,
        isMock: true,
        notice: 'No CMC_PRO_API_KEY set. Showing deterministic mock response.',
      },
      data: mockResponse,
    });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const latencyMs = Date.now() - startTime;
    const data = await res.json();

    return NextResponse.json(
      {
        meta: {
          latencyMs,
          endpoint: effectiveEndpoint,
          status: res.status,
          isMock: false,
          timestamp: new Date().toISOString(),
        },
        data,
      },
      { status: res.status }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Upstream API error',
        meta: {
          latencyMs: Date.now() - startTime,
          endpoint: effectiveEndpoint,
          status: 500,
          isMock: false,
        },
      },
      { status: 500 }
    );
  }
}

function getMockData(targetUrl: URL) {
  if (targetUrl.pathname === QUOTES_ENDPOINT) {
    const rawSymbols = targetUrl.searchParams.get('symbol');

    if (!rawSymbols) {
      return {
        error: 'The symbol query parameter is required for quotes/latest.',
      };
    }

    const requestedSymbols = rawSymbols
      .split(',')
      .map((symbol) => symbol.trim())
      .filter(Boolean);

    const filteredQuotes = Object.fromEntries(
      requestedSymbols
        .map((symbol) => {
          const matchingKey = Object.keys(MOCK_QUOTES).find(
            (quoteSymbol) => quoteSymbol.toLowerCase() === symbol.toLowerCase()
          );

          return matchingKey
            ? [matchingKey, MOCK_QUOTES[matchingKey as keyof typeof MOCK_QUOTES]]
            : null;
        })
        .filter((entry): entry is [string, (typeof MOCK_QUOTES)[keyof typeof MOCK_QUOTES]] =>
          Boolean(entry)
        )
    );

    return filteredQuotes;
  }

  if (ISSUERS_ENDPOINTS.has(targetUrl.pathname)) {
    return {
      issuers: MOCK_ISSUERS,
    };
  }

  return {
    error: 'Unsupported mock endpoint.',
  };
}
