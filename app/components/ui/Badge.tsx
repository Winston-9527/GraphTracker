import * as React from "react";
import { cn } from "@/app/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-zinc-800 text-zinc-300 border-zinc-700",
      success:
        "bg-emerald-900/30 text-emerald-400 border-emerald-800",
      warning:
        "bg-amber-900/30 text-amber-400 border-amber-800",
      danger:
        "bg-red-900/30 text-red-400 border-red-800",
      info:
        "bg-blue-900/30 text-blue-400 border-blue-800",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
