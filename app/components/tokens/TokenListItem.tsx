"use client";

import Image from "next/image";
import { cn } from "@/app/lib/utils";
import { formatPrice, formatPercent, formatCurrency } from "@/app/lib/utils/format";
import type { BinanceAlphaToken } from "@/types";

export interface TokenListItemProps {
  token: BinanceAlphaToken;
  isSelected?: boolean;
  onClick?: (token: BinanceAlphaToken) => void;
  className?: string;
}

export function TokenListItem({
  token,
  isSelected = false,
  onClick,
  className,
}: TokenListItemProps) {
  const percentChange = parseFloat(token.percentChange24h);
  const isPositive = percentChange >= 0;

  return (
    <div
      role="listitem"
      data-testid="token-list-item"
      data-token-id={token.alphaId}
      onClick={() => onClick?.(token)}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg cursor-pointer",
        "border border-transparent transition-all duration-200",
        "hover:border-zinc-700 hover:bg-zinc-800/60",
        isSelected && "border-zinc-600 bg-zinc-800/80 ring-1 ring-zinc-500/20",
        className
      )}
    >
      <div className="relative flex-shrink-0">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-zinc-700">
          {token.iconUrl ? (
            <Image
              src={token.iconUrl}
              alt={token.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
              <span className="text-xs font-bold text-zinc-400">{token.symbol.slice(0, 2)}</span>
            </div>
          )}
        </div>
        {token.chainIconUrl && (
          <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-700">
            <Image
              src={token.chainIconUrl}
              alt={token.chainName}
              fill
              className="object-cover"
              sizes="16px"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-sm text-zinc-100 truncate">{token.symbol}</span>
            <span className="text-xs text-zinc-500 truncate">{token.name}</span>
          </div>
          <span className="text-sm font-medium text-zinc-200 tabular-nums">
            {formatPrice(token.price)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="tabular-nums">MCap: {formatCurrency(token.marketCap)}</span>
            <span className="tabular-nums">Vol: {formatCurrency(token.volume24h)}</span>
          </div>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              isPositive ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {formatPercent(token.percentChange24h)}
          </span>
        </div>
      </div>
    </div>
  );
}
