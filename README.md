# 🏛️ CMC RWA Arbitrage & Issuer Intelligence Terminal

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/davidwpace/cmc-rwa-terminal&env=CMC_PRO_API_KEY&envDescription=Enter%20your%20CoinMarketCap%20Startup%20or%20Pro%20API%20Key&envLink=https://coinmarketcap.com/api)

> Built for the **Build with CMC: API Hackathon** (Track: **Real World Assets**)  
> Solves the pricing discrepancy between TradFi spot markets and on-chain tokenized RWAs (Treasuries, Gold, Equities).

---

## 🚀 One-Click Quickstart

Click the **Deploy with Vercel** badge above. Vercel will prompt you for a
single environment variable:

- `CMC_PRO_API_KEY`: Your CoinMarketCap API key.

To run locally:

```bash
git clone https://github.com/davidwpace/cmc-rwa-terminal.git
cd cmc-rwa-terminal
npm install
cp .env.example .env.local
# Add your key to .env.local
npm run dev
```

---

## 🎯 Hackathon Submission Details

### 1. Selected Track

- **Real World Assets (RWA)**

### 2. Endpoints Used Explicitly

- `/v1/cryptocurrency/quotes/latest` - Multi-symbol batch pricing quotes for
  on-chain RWA tokens (`PAXG`, `XAUT`, `USDY`, `BUIDL`, `bAAPL`).

### 3. Architecture & API Security

- **Serverless BFF Proxy:** Implemented at `app/api/cmc/route.ts`. The browser
  client never touches or leaks the `CMC_PRO_API_KEY`.
- **Rate-Limit & Credit Defense:** Configured with `next: { revalidate: 60 }` to
  avoid burning through Startup-tier call credits.
- **Visible Proof of Call:** Built-in "Judge API Audit" drawer displaying the
  active API endpoint, upstream latency, HTTP response status, and raw JSON
  response payload.

### 4. What the API Made Possible & Where It Got in the Way

- **What it made possible:** The unified metadata catalog allowed rapid
  cross-referencing between diverse token types (Commodities, Equities, Fixed
  Income) in a single consolidated interface without building separate scraping
  pipelines.
- **Where it got in the way:** RWA endpoints require normalization of different
  pricing units (e.g., yield-bearing tokens like USDY accumulate value vs. pure
  stable-pegged tokens). Combining spot quotes with NAV benchmarks required a
  dedicated client calculation engine.

---

## 📄 License

MIT License. Free to use and fork.
