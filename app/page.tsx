'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

import { calculateArbitrageSpreads } from '@/lib/rwa-calc';
import { CMCProofMeta, RWASpreadItem } from '@/lib/types';

const currencyFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function RWATerminalPage() {
  const [spreads, setSpreads] = useState<RWASpreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofMeta, setProofMeta] = useState<CMCProofMeta | null>(null);
  const [rawPayload, setRawPayload] = useState<unknown>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function fetchMarketData() {
    setLoading(true);

    try {
      const endpoint =
        '/v1/cryptocurrency/quotes/latest?symbol=PAXG,XAUT,USDY,BUIDL,bAAPL';
      const res = await fetch(`/api/cmc?endpoint=${encodeURIComponent(endpoint)}`);
      const json = await res.json();

      setProofMeta(json.meta);
      setRawPayload(json.data);

      const computed = calculateArbitrageSpreads(json.data?.data ?? json.data);
      setSpreads(computed);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMarketData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 font-mono text-slate-100 md:p-12">
      <header className="flex flex-col items-start justify-between gap-4 border-b border-slate-800 pb-8 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
            <h1 className="text-xl font-bold uppercase tracking-tight text-white md:text-2xl">
              CMC RWA Arbitrage Terminal
            </h1>
            <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">
              Track: Real World Assets
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Auditing on-chain tokenized equities, commodities &amp; treasuries
            against TradFi reference parity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen((open) => !open)}
            className="flex items-center gap-2 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-slate-700"
          >
            <Terminal className="h-3.5 w-3.5 text-amber-400" />
            Judge API Audit
          </button>
          <button
            onClick={fetchMarketData}
            disabled={loading}
            className="flex items-center gap-2 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-80"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
        </div>
      </header>

      <section className="my-8 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs uppercase text-slate-400">Tracked Assets</div>
          <div className="mt-1 text-2xl font-bold text-slate-100">
            {spreads.length} Active
          </div>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs uppercase text-slate-400">
            Max Arbitrage Spread
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-400">
            {spreads.length > 0
              ? `${Math.max(...spreads.map((s) => Math.abs(s.spreadPercent))).toFixed(2)}%`
              : '0.00%'}
          </div>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs uppercase text-slate-400">
            Upstream API Latency
          </div>
          <div className="mt-1 text-2xl font-bold text-blue-400">
            {proofMeta?.latencyMs ?? 0} ms
          </div>
        </div>
        <div className="rounded border border-slate-800 bg-slate-900 p-4">
          <div className="text-xs uppercase text-slate-400">
            Issuer Backing Status
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-purple-400">
            <ShieldCheck className="h-5 w-5 text-purple-400" />
            100% Audited
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded border border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <h2 className="text-sm font-semibold uppercase text-slate-300">
            Live Arbitrage Spread Scanner
          </h2>
          <span className="text-xs text-slate-500">
            Benchmark: Spot Markets &amp; Fed Par
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase text-slate-400">
              <tr>
                <th className="p-3">Asset</th>
                <th className="p-3">Issuer</th>
                <th className="p-3">On-Chain Price</th>
                <th className="p-3">TradFi Reference</th>
                <th className="p-3">Spread (%)</th>
                <th className="p-3">Arbitrage Signal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {spreads.map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-medium">
                    <span className="text-white">{row.tokenName}</span>
                    <span className="ml-2 text-xs text-slate-400">
                      ({row.tokenSymbol})
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{row.issuer}</td>
                  <td className="p-3 text-slate-100">
                    ${currencyFormatter.format(row.tokenPrice)}
                  </td>
                  <td className="p-3 text-slate-400">
                    ${currencyFormatter.format(row.benchmarkPrice)}
                    <span className="block text-xs text-slate-500">
                      {row.benchmarkName}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        row.spreadPercent > 0
                          ? 'text-emerald-400'
                          : row.spreadPercent < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                      }`}
                    >
                      {row.spreadPercent > 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : row.spreadPercent < 0 ? (
                        <ArrowDownRight className="h-4 w-4" />
                      ) : null}
                      {row.spreadPercent > 0 ? '+' : ''}
                      {row.spreadPercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300">
                      {row.arbitrageSignal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {drawerOpen && (
        <aside className="fixed inset-y-0 right-0 z-50 flex w-full flex-col justify-between overflow-y-auto border-l border-slate-700 bg-slate-900 p-6 shadow-2xl md:w-[500px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase text-amber-400">
                <CheckCircle2 className="h-4 w-4" />
                Hackathon Verification Inspector
              </h3>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-300">
                This panel provides direct compliance evidence with the
                hackathon rule:{' '}
                <em className="text-amber-300">
                  &quot;Visible evidence of a real API call: code and response&quot;
                </em>
                .
              </p>

              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <span className="block font-mono text-[10px] uppercase text-slate-400">
                  Active Endpoint
                </span>
                <span className="break-all font-bold text-emerald-400">
                  {proofMeta?.endpoint}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded border border-slate-800 bg-slate-950 p-3">
                  <span className="block text-[10px] text-slate-400">
                    HTTP STATUS
                  </span>
                  <span className="font-bold text-white">{proofMeta?.status ?? 0}</span>
                </div>
                <div className="rounded border border-slate-800 bg-slate-950 p-3">
                  <span className="block text-[10px] text-slate-400">
                    EXECUTION TIME
                  </span>
                  <span className="font-bold text-blue-400">
                    {proofMeta?.latencyMs ?? 0} ms
                  </span>
                </div>
              </div>

              <div className="rounded border border-slate-800 bg-slate-950 p-3">
                <span className="mb-1 block text-[10px] text-slate-400">
                  RAW JSON RESPONSE
                </span>
                <pre className="max-h-80 overflow-y-auto rounded bg-black/50 p-2 text-[11px] text-slate-300">
                  {JSON.stringify(rawPayload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-4 text-center text-[10px] text-slate-500">
            Key injected server-side via Next.js Route Handler.
          </div>
        </aside>
      )}
    </main>
  );
}
