"use client";

import { useToast } from "@/hooks/use-toast";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 pointer-events-none sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, variant }) => {
        const isDestructive = variant === "destructive";
        const isSuccess = variant === "success";
        const isWarning = variant === "warning";

        return (
          <ToastItem
            key={id}
            id={id}
            title={title}
            description={description}
            variant={variant}
            isDestructive={isDestructive}
            isSuccess={isSuccess}
            isWarning={isWarning}
            dismiss={dismiss}
          />
        );
      })}
    </div>
  );
}

function ToastItem({
  id,
  title,
  description,
  variant,
  isDestructive,
  isSuccess,
  isWarning,
  dismiss,
}: any) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const duration = 3000; // 3 seconds
    const interval = 10; // Update every 10ms
    const decrement = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        return next <= 0 ? 0 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleDismiss = () => {
    setIsPaused(true);
    dismiss(id);
  };

  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-6 pr-8 transition-all animate-in fade-in slide-in-from-right-full mb-3",
        isDestructive
          ? "bg-destructive text-destructive-foreground border-destructive/20"
          : isSuccess
            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
            : isWarning
              ? "bg-amber-50 text-amber-900 border-amber-200"
              : "bg-background text-foreground border-border",
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex gap-4">
        <div className="mt-0.5">
          {isDestructive && (
            <AlertCircle className="h-5 w-5 text-destructive" />
          )}
          {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          {isWarning && <AlertTriangle className="h-5 w-5 text-amber-600" />}
          {!isDestructive && !isSuccess && !isWarning && (
            <Info className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="grid gap-1">
          {title && (
            <div className="text-sm font-black leading-none">{title}</div>
          )}
          {description && (
            <div className="text-xs font-medium opacity-90 leading-relaxed">
              {description}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className={cn(
          "absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2",
          isDestructive
            ? "text-destructive-foreground/70 hover:text-destructive-foreground"
            : isSuccess
              ? "text-emerald-700 hover:text-emerald-900"
              : isWarning
                ? "text-amber-700 hover:text-amber-900"
                : "text-foreground/50 hover:text-foreground",
        )}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
        <div
          className={cn(
            "h-full transition-all",
            isDestructive
              ? "bg-destructive-foreground/30"
              : isSuccess
                ? "bg-emerald-600/40"
                : isWarning
                  ? "bg-amber-600/40"
                  : "bg-primary/40",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
