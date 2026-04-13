"use client";

import Image from "next/image";
import { Card } from "@/app/components/ui/Card";
import { cn } from "@/app/lib/utils";
import type { BinanceAlphaToken } from "@/types";

export interface TokenCardProps {
  token: BinanceAlphaToken;
  isSelected?: boolean;
  onClick?: (token: BinanceAlphaToken) => void;
  className?: string;
}

function formatCurrency(value: string): string {
  const num = parseFloat(value);
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  }
  if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  }
  if (num >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  }
  return `$${num.toFixed(2)}`;
}

function formatPrice(value: string): string {
  const num = parseFloat(value);
  if (num < 0.01) {
    return `$${num.toExponential(2)}`;
  }
  return `$${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })}`;
}

export function TokenCard({
  token,
  isSelected = false,
  onClick,
  className,
}: TokenCardProps) {
  const percentChange = parseFloat(token.percentChange24h);
  const isPositive = percentChange >= 0;

  return (
    <Card
      variant={isSelected ? "default" : "outline"}
      onClick={() => onClick?.(token)}
      className={cn(
        "group cursor-pointer transition-all duration-200",
        "hover:border-zinc-600 hover:bg-zinc-800/80",
        isSelected && "border-zinc-500 bg-zinc-800/90 ring-1 ring-zinc-500/20",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-700">
            {token.iconUrl ? (
              <Image
                src={token.iconUrl}
                alt={token.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
                <span className="text-sm font-bold text-zinc-400">
                  {token.symbol.slice(0, 2)}
                </span>
              </div>
          )}
        </div>

        {token.chainIconUrl && (
            <div className="absolute -bottom-1 -right-1 h-5 w-5 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-700">
              <Image
                src={token.chainIconUrl}
                alt={token.chainName}
                fill
                className="object-cover"
                sizes="20px"
              />
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100">{token.symbol}</span>
              <span className="text-sm text-zinc-500">{token.name}</span>
            </div>
            <span className="text-sm font-medium text-zinc-300">
              {formatPrice(token.price)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span>MCap: {formatCurrency(token.marketCap)}</span>
              <span>Vol: {formatCurrency(token.volume24h)}</span>
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {isPositive ? "+" : ""}
              {percentChange.toFixed(2)}%
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400 ring-1 ring-zinc-700">
              {token.chainName}
            </span>
            {token.bnExclusiveState && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400 ring-1 ring-amber-500/20">
                Exclusive
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
