import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border border-amber-500/40 bg-amber-500/15 text-amber-300 font-bold",
        secondary:
          "border-transparent bg-slate-800 text-slate-200",
        destructive:
          "border-transparent bg-rose-500/20 text-rose-300 border border-rose-500/40",
        warning:
          "border border-amber-500/40 bg-amber-500/20 text-amber-300 font-black",
        info:
          "border-transparent bg-sky-500/20 text-sky-300 border border-sky-500/40",
        emerald:
          "border border-amber-500/30 bg-amber-500/10 text-amber-400",
        gold:
          "border border-amber-400/60 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 font-black shadow-xs",
        outline:
          "border border-slate-700 text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
