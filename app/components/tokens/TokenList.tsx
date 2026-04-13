"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/Card";
import { TokenCard } from "./TokenCard";
import type { BinanceAlphaToken } from "@/types";

export interface TokenListProps {
  tokens: BinanceAlphaToken[];
  selectedTokenId?: string;
  onSelectToken: (token: BinanceAlphaToken) => void;
  isLoading?: boolean;
  className?: string;
}

function SkeletonCard() {
  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-lg">
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
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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

  const filteredTokens = useMemo(() => {
    if (!searchQuery.trim()) return tokens;
    const query = searchQuery.toLowerCase();
    return tokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.chainName.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

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
            className={cn(
              "w-full pl-9 pr-4 py-2 rounded-lg",
              "bg-zinc-900/50 border border-zinc-800",
              "text-sm text-zinc-100 placeholder:text-zinc-500",
              "focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-600",
              "transition-all duration-200"
            )}
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="h-[400px] overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredTokens.length === 0 ? (
            <EmptyState />
          ) : (
            filteredTokens.map((token) => (
              <TokenCard
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
