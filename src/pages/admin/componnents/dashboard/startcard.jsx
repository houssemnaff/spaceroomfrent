import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const variantColors = {
  default: { border: "border-l-primary", iconBg: "bg-primary/10", iconColor: "text-primary" },
  info: { border: "border-l-royal", iconBg: "bg-royal/10", iconColor: "text-royal" },
  success: { border: "border-l-emerald", iconBg: "bg-emerald/10", iconColor: "text-emerald-500" },
  warning: { border: "border-l-amber", iconBg: "bg-amber/10", iconColor: "text-amber-500" },
  danger: { border: "border-l-rose", iconBg: "bg-rose/10", iconColor: "text-rose-500" },
  purple: { border: "border-l-deepPurple", iconBg: "bg-deepPurple/10", iconColor: "text-deepPurple" },
  plain: { border: "", iconBg: "bg-muted", iconColor: "text-muted-foreground" }
};

export function StatCard({
  title,
  value,
  icon,
  change,
  changeLabel,
  variant = "default",
  className,
  valueClassName,
  formatter = (val) => `${val}`,
}) {
  const { border, iconBg, iconColor } = variantColors[variant] || variantColors.default;
  const formattedValue = formatter(value);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md bg-white dark:bg-muted",
        `border-l-4 ${border}`,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold", valueClassName)}>{formattedValue}</p>

          {typeof change !== "undefined" && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-sm font-medium",
                change >= 0 ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {change >= 0 ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              <span>{Math.abs(change)}%</span>
              {changeLabel && (
                <span className="ml-1 text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div
            className={cn(
              "shrink-0 rounded-full p-2",
              iconBg,
              iconColor
            )}
          >
            {React.cloneElement(icon, { className: "h-6 w-6" })}
          </div>
        )}
      </div>
    </div>
  );
}
