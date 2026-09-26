# 🏛️ CMC RWA Arbitrage & Issuer Intelligence Terminal

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/davidwpace/cmc-rwa-terminal&env=CMC_PRO_API_KEY&envDescription=Enter%20your%20CoinMarketCap%20Startup%20or%20Pro%20API%20Key&envLink=https://coinmarketcap.com/api)

> Built for the **Build with CMC: API Hackathon** (Track: **Real World Assets**)  
> Combines an arbitrage scanner with issuer intelligence so judges can verify pricing dislocations and reserve credibility in one terminal.

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

To run unit tests:

```bash
npm test
```

---

## 🎯 Hackathon Submission Details

### 1. Selected Track

- **Real World Assets (RWA)**

### 2. Endpoints Used Explicitly

- `/v1/cryptocurrency/quotes/latest` - Multi-symbol batch pricing quotes for
  on-chain RWA tokens (`PAXG`, `XAUT`, `USDY`, `BUIDL`, `bAAPL`).
- `/v1/real-world-assets/issuers` - Issuer reserve and roster intelligence used
  by the Issuer Intelligence tab.

### 3. Architecture & API Security

- **Serverless BFF Proxy:** Implemented at `app/api/cmc/route.ts`. The browser
  client never touches or leaks the `CMC_PRO_API_KEY`.
- **Selective Endpoint Allowlist:** The proxy only permits the implemented quote
  and issuer intelligence routes so the terminal stays hackathon-focused and
  avoids open proxy behavior.
- **Rate-Limit & Credit Defense:** Configured with `next: { revalidate: 60 }` to
  avoid burning through Startup-tier call credits.
- **Visible Proof of Call:** Built-in "Judge API Audit" drawer displaying the
  active API endpoint, upstream latency, HTTP response status, and raw JSON
  response payload.

### 4. What the API Makes Possible

- **Arbitrage Scanner:** Surfaces premium/discount discrepancies between tokenized
  RWAs and their TradFi benchmarks.
- **Issuer Intelligence:** Maps each issuer to category focus, linked token
  roster, reserve backing summary, and audit status.
- **Judge-Ready Verification:** Gives DoraHacks reviewers a single interface for
  both market activity and reserve credibility without needing wallets or custom
  tooling.

---

## 📄 License

MIT License. Free to use and fork.
