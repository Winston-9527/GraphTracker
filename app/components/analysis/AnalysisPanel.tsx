"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/app/components/ui/Card";
import { Badge } from "@/app/components/ui/Badge";
import { cn } from "@/app/lib/utils";
import type { GraphAnalysis, RiskLevel } from "@/types/ai";
import { AlertTriangle, CheckCircle, Info, ShieldAlert, Users, Clock, Activity } from "lucide-react";

export interface AnalysisPanelProps {
  analysis: GraphAnalysis | null;
  isLoading?: boolean;
  className?: string;
}

const riskBadgeVariantMap: Record<RiskLevel, "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

const riskLabelMap: Record<RiskLevel, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
};

const riskScoreColorMap: Record<RiskLevel, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
};

const riskProgressColorMap: Record<RiskLevel, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ProgressBar({ 
  value, 
  max = 100, 
  colorClass 
}: { 
  value: number; 
  max?: number; 
  colorClass: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", colorClass)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <Card className={cn("h-full")}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-zinc-800/50 p-4">
          <Activity className="h-8 w-8 text-zinc-500" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-zinc-300">
          No Analysis Available
        </h3>
        <p className="max-w-xs text-sm text-zinc-500">
          Select a token and run AI analysis to see risk assessment, centralization scores, and key findings.
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <Card className={cn("h-full")}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        <p className="text-sm text-zinc-500">Analyzing token data...</p>
      </CardContent>
    </Card>
  );
}

export function AnalysisPanel({
  analysis,
  isLoading = false,
  className,
}: AnalysisPanelProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!analysis) {
    return <EmptyState />;
  }

  const riskVariant = riskBadgeVariantMap[analysis.risk_level];
  const riskLabel = riskLabelMap[analysis.risk_level];
  const riskScoreColor = riskScoreColorMap[analysis.risk_level];
  const progressColor = riskProgressColorMap[analysis.risk_level];

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
              <ShieldAlert className="h-5 w-5 text-zinc-400" />
            </div>
            <div>
              <CardTitle>AI Analysis</CardTitle>
              <CardDescription>
                {analysis.token_symbol} on Chain {analysis.chain_id}
              </CardDescription>
            </div>
          </div>
          <Badge variant={riskVariant}>{riskLabel}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg bg-zinc-800/50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-400">Risk Score</span>
            <span className={cn("text-2xl font-bold", riskScoreColor)}>
              {analysis.risk_level === "low" ? "Low" : analysis.risk_level === "medium" ? "Medium" : "High"}
            </span>
          </div>
          <ProgressBar 
            value={analysis.risk_level === "low" ? 25 : analysis.risk_level === "medium" ? 60 : 90} 
            colorClass={progressColor} 
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-300">Centralization Score</span>
            </div>
            <span className={cn(
              "text-sm font-semibold",
              analysis.centralization_score > 70 ? "text-red-400" : 
              analysis.centralization_score > 40 ? "text-amber-400" : "text-emerald-400"
            )}>
              {analysis.centralization_score}/100
            </span>
          </div>
          <ProgressBar 
            value={analysis.centralization_score} 
            colorClass={
              analysis.centralization_score > 70 ? "bg-red-500" : 
              analysis.centralization_score > 40 ? "bg-amber-500" : "bg-emerald-500"
            } 
          />
          <p className="text-xs text-zinc-500">
            {analysis.centralization_score > 70 
              ? "High concentration of tokens among few holders" 
              : analysis.centralization_score > 40 
                ? "Moderate token distribution" 
                : "Well-distributed token holdings"}
          </p>
        </div>

        {analysis.key_findings.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <Info className="h-4 w-4 text-blue-400" />
              Key Findings
            </h4>
            <ul className="space-y-2">
              {analysis.key_findings.map((finding, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2 text-sm text-zinc-400"
                >
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-600" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.suspicious_patterns.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Suspicious Patterns
            </h4>
            <ul className="space-y-2">
              {analysis.suspicious_patterns.map((pattern, index) => (
                <li 
                  key={index} 
                  className="flex items-start gap-2 text-sm text-zinc-400"
                >
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500/60" />
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.holder_analysis.length > 0 && (
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
              <Users className="h-4 w-4 text-zinc-500" />
              Holder Analysis
            </h4>
            <div className="rounded-lg bg-zinc-800/30 p-3">
              <p className="text-sm text-zinc-400">
                <span className="font-medium text-zinc-300">{analysis.holder_analysis.length}</span> addresses analyzed
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {analysis.holder_analysis.slice(0, 3).map((holder, index) => (
                  <Badge key={index} variant="default" className="text-xs">
                    {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                  </Badge>
                ))}
                {analysis.holder_analysis.length > 3 && (
                  <Badge variant="default" className="text-xs">
                    +{analysis.holder_analysis.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Clock className="h-3 w-3" />
          <span>Analyzed {formatTimestamp(analysis.analyzed_at)}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
