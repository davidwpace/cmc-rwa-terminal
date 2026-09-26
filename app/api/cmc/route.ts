import { NextRequest, NextResponse } from 'next/server';

const CMC_BASE_URL = 'https://pro-api.coinmarketcap.com';
const ALLOWED_ENDPOINTS = new Set(['/v1/cryptocurrency/quotes/latest']);

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
    parsedEndpoint.origin !== CMC_BASE_URL ||
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
  const startTime = Date.now();

  if (!apiKey) {
    return NextResponse.json({
      meta: {
        latencyMs: 14,
        endpoint,
        status: 200,
        isMock: true,
        notice: 'No CMC_PRO_API_KEY set. Showing deterministic mock response.',
      },
      data: getMockData(endpoint),
    });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
    });

    const latencyMs = Date.now() - startTime;
    const data = await res.json();

    return NextResponse.json(
      {
        meta: {
          latencyMs,
          endpoint,
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
          endpoint,
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}

function getMockData(endpoint: string) {
  if (endpoint.includes('quotes/latest')) {
    return {
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
    };
  }

  return {
    issuers: [
      {
        name: 'Ondo Finance',
        aum_usd: 620000000,
        category: 'US Treasuries',
        audited: true,
      },
      {
        name: 'Paxos Trust',
        aum_usd: 540000000,
        category: 'Precious Metals',
        audited: true,
      },
      {
        name: 'Tether',
        aum_usd: 590000000,
        category: 'Precious Metals',
        audited: true,
      },
      {
        name: 'Backed Finance',
        aum_usd: 95000000,
        category: 'Equities & ETFs',
        audited: true,
      },
    ],
  };
}
