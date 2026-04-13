"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/lib/utils";
import type { BinanceAlphaToken } from "@/types";

export interface TokenDetailProps {
  token: BinanceAlphaToken | null;
  onAnalyze?: () => void;
  className?: string;
}

function formatNumber(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;

  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

function formatPrice(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;

  if (num < 0.01) return `$${num.toFixed(6)}`;
  if (num < 1) return `$${num.toFixed(4)}`;
  return `$${num.toFixed(2)}`;
}

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

export function TokenDetail({ token, onAnalyze, className }: TokenDetailProps) {
  if (!token) {
    return (
      <Card className={cn("h-full", className)}>
        <CardContent className="flex h-full flex-col items-center justify-center py-12">
          <div className="rounded-full bg-zinc-800/50 p-4">
            <svg
              className="h-8 w-8 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <p className="mt-4 text-sm text-zinc-400">
            Select a token to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  const percentChange = parseFloat(token.percentChange24h);
  const isPositive = percentChange >= 0;

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-800">
              {token.iconUrl ? (
                <Image
                  src={token.iconUrl}
                  alt={token.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-xs font-bold text-zinc-400">
                  {token.symbol.slice(0, 2)}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-zinc-100">
                  {token.symbol}
                </h2>
                <Badge variant="default">{token.chainName}</Badge>
              </div>
              <p className="text-sm text-zinc-400">{token.name}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold text-zinc-100">
              {formatPrice(token.price)}
            </p>
            <p
              className={cn(
                "text-sm font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {isPositive ? "+" : ""}
              {percentChange.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-lg bg-zinc-900/50 px-3 py-2">
          <span className="text-xs text-zinc-500">Contract:</span>
          <code className="flex-1 text-xs text-zinc-300">
            {truncateAddress(token.contractAddress)}
          </code>
          <button
            className="rounded p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            title="Copy address"
            onClick={() => {
              console.log("Copy address:", token.contractAddress);
            }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <StatItem label="Market Cap" value={formatNumber(token.marketCap)} />
          <StatItem label="Volume (24h)" value={formatNumber(token.volume24h)} />
          <StatItem label="Liquidity" value={formatNumber(token.liquidity)} />
          <StatItem
            label="Total Supply"
            value={parseFloat(token.totalSupply).toLocaleString()}
          />
          <StatItem
            label="Circulating Supply"
            value={parseFloat(token.circulatingSupply).toLocaleString()}
            className="col-span-2"
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={onAnalyze}
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Analyze Token
        </Button>
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
        "rounded-lg bg-zinc-900/30 px-3 py-2.5 transition-colors hover:bg-zinc-900/50",
        className
      )}
    >
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}
