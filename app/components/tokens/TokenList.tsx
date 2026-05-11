"use client";

import { useState, useMemo } from "react";
import { Search, ArrowUpDown, TrendingUp, BarChart3 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/Card";
import { TokenListItem } from "./TokenListItem";
import type { BinanceAlphaToken } from "@/types";

type SortField = "marketCap" | "volume24h";
type SortDirection = "asc" | "desc";

export interface TokenListProps {
  tokens: BinanceAlphaToken[];
  selectedTokenId?: string;
  onSelectToken: (token: BinanceAlphaToken) => void;
  isLoading?: boolean;
  className?: string;
}

function SkeletonItem() {
  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-lg" data-testid="skeleton-item">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-800 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-16 h-4 rounded bg-zinc-800 animate-pulse" />
          <div className="w-20 h-3 rounded bg-zinc-800/50 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-3 rounded bg-zinc-800/50 animate-pulse" />
          <div className="w-10 h-3 rounded bg-zinc-800/50 animate-pulse" />
        </div>
      </div>
      <div className="flex-shrink-0 w-16 h-6 rounded-md bg-zinc-800/50 animate-pulse" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center" data-testid="empty-state">
      <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-3">
        <Search className="w-5 h-5 text-zinc-500" />
      </div>
      <p className="text-zinc-400 font-medium">No tokens found</p>
      <p className="text-sm text-zinc-500 mt-1">Try adjusting your search</p>
    </div>
  );
}

export function TokenList({
  tokens,
  selectedTokenId,
  onSelectToken,
  isLoading = false,
  className,
}: TokenListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredTokens = useMemo(() => {
    let result = tokens;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (token) =>
          token.symbol.toLowerCase().includes(query) ||
          token.name.toLowerCase().includes(query) ||
          token.chainName.toLowerCase().includes(query)
      );
    }

    result = [...result].sort((a, b) => {
      const aVal = parseFloat(a[sortField]);
      const bVal = parseFloat(b[sortField]);
      return sortDirection === "desc" ? bVal - aVal : aVal - bVal;
    });

    return result;
  }, [tokens, searchQuery, sortField, sortDirection]);

  return (
    <Card className={cn("w-full max-w-md flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>Binance Alpha Tokens</CardTitle>
          {!isLoading && (
            <span className="text-sm text-zinc-500">
              {filteredTokens.length} token{filteredTokens.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="search-input"
            className={cn(
              "w-full pl-9 pr-4 py-2 rounded-lg",
              "bg-zinc-900/50 border border-zinc-800",
              "text-sm text-zinc-100 placeholder:text-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-600",
              "transition-all duration-200"
            )}
          />
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-zinc-500">Sort by:</span>
          <button
            data-testid="sort-marketCap"
            onClick={() => handleSort("marketCap")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors border",
              sortField === "marketCap"
                ? "bg-zinc-800 text-zinc-200 border-zinc-600"
                : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
            )}
          >
            <TrendingUp className="h-3 w-3" />
            Market Cap
            {sortField === "marketCap" && (
              <ArrowUpDown className={cn("h-3 w-3 transition-transform", sortDirection === "asc" && "rotate-180")} />
            )}
          </button>
          <button
            data-testid="sort-volume24h"
            onClick={() => handleSort("volume24h")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors border",
              sortField === "volume24h"
                ? "bg-zinc-800 text-zinc-200 border-zinc-600"
                : "bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
            )}
          >
            <BarChart3 className="h-3 w-3" />
            Volume
            {sortField === "volume24h" && (
              <ArrowUpDown className={cn("h-3 w-3 transition-transform", sortDirection === "asc" && "rotate-180")} />
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="h-[400px] overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {isLoading ? (
            <>
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
              <SkeletonItem />
            </>
          ) : filteredTokens.length === 0 ? (
            <EmptyState />
          ) : (
            filteredTokens.map((token) => (
              <TokenListItem
                key={token.alphaId}
                token={token}
                isSelected={selectedTokenId === token.alphaId}
                onClick={onSelectToken}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
