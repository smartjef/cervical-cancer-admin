"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCard {
    label: string
    value: string | number
    icon: LucideIcon
    description?: string
    color?: string
}

interface StatisticsCardsProps {
    stats: StatCard[]
}

export default function StatisticsCards({ stats }: StatisticsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
                <Card key={index} className="border-none bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                    <div
                        className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none"
                        style={{ color: stat.color || 'var(--primary)' }}
                    >
                        <stat.icon size={128} strokeWidth={1} />
                    </div>

                    <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-3xl font-black tracking-tighter text-foreground">
                                        {stat.value}
                                    </h3>
                                    {stat.description && (
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                            {stat.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
