import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CMC RWA Arbitrage Terminal',
  description:
    'Real-Time Discrepancy & Reserve Terminal built for Build with CMC API Hackathon',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
