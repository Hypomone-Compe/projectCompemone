import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex gap-3 rounded-lg border px-[18px] py-4 text-sm leading-[1.55]", {
  variants: {
    variant: {
      success: "border-success/30 bg-success-pale text-success",
      error: "border-red/30 bg-red-pale text-red",
      warning: "border-warning/30 bg-warning-pale text-warning",
      info: "border-blue/30 bg-blue-pale text-blue",
    },
  },
  defaultVariants: { variant: "info" },
});

const icons: Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, LucideIcon> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof alertVariants> {
  title?: React.ReactNode;
}

export function Alert({ variant = "info", title, className, children, ...props }: AlertProps) {
  const Icon = icons[variant ?? "info"];
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
      <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0" />
      <div>
        {title && <span className="mb-0.5 block font-bold">{title}</span>}
        {children}
      </div>
    </div>
  );
}
