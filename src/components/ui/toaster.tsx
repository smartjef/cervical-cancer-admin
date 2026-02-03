"use client"

import { useToast } from "@/hooks/use-toast"
import {
    X,
    CheckCircle2,
    AlertCircle,
    Info,
    AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
    const { toasts, dismiss } = useToast()

    return (
        <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 pointer-events-none sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
            {toasts.map(({ id, title, description, variant }) => {
                const isDestructive = variant === "destructive"
                const isSuccess = variant === "success"
                const isWarning = variant === "warning"

                return (
                    <div
                        key={id}
                        className={cn(
                            "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-6 pr-8 shadow-lg transition-all animate-in fade-in slide-in-from-right-full mb-3",
                            isDestructive ? "bg-destructive text-destructive-foreground border-destructive/20" :
                                isSuccess ? "bg-emerald-50 text-emerald-900 border-emerald-200" :
                                    isWarning ? "bg-amber-50 text-amber-900 border-amber-200" :
                                        "bg-background text-foreground border-border"
                        )}
                    >
                        <div className="flex gap-4">
                            <div className="mt-0.5">
                                {isDestructive && <AlertCircle className="h-5 w-5 text-destructive" />}
                                {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                                {isWarning && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                                {!isDestructive && !isSuccess && !isWarning && <Info className="h-5 w-5 text-primary" />}
                            </div>
                            <div className="grid gap-1">
                                {title && <div className="text-sm font-black leading-none">{title}</div>}
                                {description && (
                                    <div className="text-xs font-medium opacity-90 leading-relaxed">
                                        {description}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => dismiss(id)}
                            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
