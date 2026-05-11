"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ExternalLink, Copy, Check, Globe, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { cn } from "@/app/lib/utils";
import { truncateAddress, formatPrice, formatCurrency, formatPercent } from "@/app/lib/utils/format";
import type { BinanceAlphaToken } from "@/types";

const EXPLORER_URLS: Record<string, string> = {
  '56': 'https://bscscan.com',
  '1': 'https://etherscan.io',
  '8453': 'https://basescan.org',
};

const EXPLORER_NAMES: Record<string, string> = {
  '56': 'BscScan',
  '1': 'Etherscan',
  '8453': 'BaseScan',
};

export interface TokenInfoProps {
  token: BinanceAlphaToken | null;
  className?: string;
}

export function TokenInfo({ token, className }: TokenInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy address");
    }
  }, []);

  if (!token) {
    return (
      <Card className={cn("h-full min-h-[360px]", className)}>
        <CardContent className="flex h-full flex-col items-center justify-center py-12">
          <div className="rounded-full bg-zinc-800/50 p-4">
            <BarChart3 className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="mt-4 text-sm text-zinc-400">Select a token to view details</p>
        </CardContent>
      </Card>
    );
  }

  const percentChange = parseFloat(token.percentChange24h);
  const isPositive = percentChange >= 0;
  const explorerUrl = EXPLORER_URLS[token.chainId];
  const explorerName = EXPLORER_NAMES[token.chainId] || 'Explorer';
  const tokenExplorerLink = explorerUrl
    ? `${explorerUrl}/token/${token.contractAddress}`
    : null;
  const alphaLink = `https://www.binance.com/en/alpha/token/${token.symbol}`;

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-700">
              {token.iconUrl ? (
                <Image
                  src={token.iconUrl}
                  alt={token.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                  <span className="text-sm font-bold text-zinc-400">{token.symbol.slice(0, 2)}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-zinc-100">{token.symbol}</h2>
                <Badge variant="default">{token.chainName}</Badge>
              </div>
              <p className="text-sm text-zinc-400">{token.name}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xl font-bold text-zinc-100 tabular-nums">
              {formatPrice(token.price)}
            </p>
            <p
              className={cn(
                "text-sm font-semibold tabular-nums",
                isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {formatPercent(token.percentChange24h)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-zinc-900/50 px-3 py-2 border border-zinc-800">
          <span className="text-xs text-zinc-500 flex-shrink-0">Contract:</span>
          <code className="flex-1 text-xs text-zinc-300 font-mono truncate" data-testid="contract-address">
            {truncateAddress(token.contractAddress)}
          </code>
          <button
            data-testid="copy-address-btn"
            className="rounded p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            title="Copy address"
            onClick={() => handleCopy(token.contractAddress)}
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Market Cap" value={formatCurrency(token.marketCap)} />
          <StatItem label="Volume (24h)" value={formatCurrency(token.volume24h)} />
          <StatItem label="Liquidity" value={formatCurrency(token.liquidity)} />
          <StatItem label="Total Supply" value={parseFloat(token.totalSupply).toLocaleString()} />
          <StatItem
            label="Circulating Supply"
            value={parseFloat(token.circulatingSupply).toLocaleString()}
            className="col-span-2"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">External Links</p>
          <div className="flex flex-wrap gap-2">
            {tokenExplorerLink && (
              <a
                href={tokenExplorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/60 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100 border border-zinc-800"
                data-testid="explorer-link"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {explorerName}
              </a>
            )}
            <a
              href={alphaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20 border border-amber-500/20"
              data-testid="alpha-link"
            >
              <Globe className="h-3.5 w-3.5" />
              Binance Alpha
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  className?: string;
}

function StatItem({ label, value, className }: StatItemProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-zinc-900/30 px-3 py-2.5 transition-colors hover:bg-zinc-900/50 border border-zinc-800/50",
        className
      )}
    >
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-200 tabular-nums">{value}</p>
    </div>
  );
}
