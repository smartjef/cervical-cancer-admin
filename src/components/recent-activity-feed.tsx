"use client"

import { useApi } from "@/hooks/use-api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Calendar } from "lucide-react"
import { useMemo } from "react"

dayjs.extend(relativeTime)

interface RecentActivityFeedProps {
    limit?: number
    userId?: string
}

export default function RecentActivityFeed({ limit = 7, userId }: RecentActivityFeedProps) {
    const queryString = useMemo(() => {
        const params = new URLSearchParams()
        params.append("limit", limit.toString())
        if (userId) params.append("userId", userId)
        return params.toString()
    }, [limit, userId])

    const { data: activityData, isLoading: activityLoading } = useApi<any>(`/activities?${queryString}`)

    const activities = useMemo(() => {
        return activityData?.results?.map((activity: any) => {
            const metadata = activity.metadata || {}
            return {
                id: activity.id,
                userId: activity.userId,
                userName: activity.user?.name || "System",
                action: activity.action,
                resource: activity.resource,
                resourceId: activity.resourceId,
                clientId: metadata.clientId,
                clientName: metadata.clientName,
                riskScore: metadata.riskScore,
                riskInterpretation: metadata.riskInterpretation,
                description: activity.description,
                createdAt: activity.createdAt,
                time: dayjs(activity.createdAt).fromNow(),
                color: activity.resource === 'screening' ? 'bg-primary' : (activity.resource === 'client' ? 'bg-secondary' : 'bg-muted')
            }
        }) || []
    }, [activityData])

    if (activityLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-muted mt-1.5"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-muted w-3/4 rounded"></div>
                            <div className="h-2 bg-muted/50 w-1/4 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-6 text-center">
                <Calendar className="h-8 w-8 text-muted-foreground/20 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">No recent activity recorded</p>
            </div>
        )
    }

    return (
        <>
            <div className="space-y-6">
                {activities.map((activity: any, i: number) => (
                    <div key={activity.id || i} className="flex gap-4">
                        <div className={`w-2 h-2 rounded-full ${activity.color} shrink-0 mt-1.5`}></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground leading-snug">
                                <Link
                                    href={`/user-management/system-users/${activity.userId}`}
                                    className="font-black hover:text-primary transition-colors"
                                >
                                    {activity.userName}
                                </Link>
                                {" "}
                                <span className="text-muted-foreground font-medium">
                                    {activity.action === 'create' ? 'created' : activity.action}
                                </span>
                                {" "}
                                {activity.resource === 'screening' ? (
                                    <>
                                        <Link
                                            href={`/screening-data/${activity.resourceId}`}
                                            className="font-bold text-primary hover:underline"
                                        >
                                            screening
                                        </Link>
                                        {activity.riskScore !== undefined && (
                                            <span className="text-xs">
                                                {" "}(Score: <span className="font-bold">{activity.riskScore}</span>, <span className="font-bold uppercase text-[10px]">{activity.riskInterpretation?.replace('_', ' ')}</span>)
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <span className="font-bold">{activity.resource}</span>
                                )}
                                {activity.clientId && (
                                    <>
                                        {" for "}
                                        <Link
                                            href={`/user-management/clients/${activity.clientId}`}
                                            className="font-bold hover:text-primary transition-colors underline decoration-border/50 underline-offset-2"
                                        >
                                            {activity.clientName || "Client"}
                                        </Link>
                                    </>
                                )}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
            {!userId && (
                <div className="pt-3 mt-1 border-t border-border/40">
                    <Link href="/activities" className="block w-full">
                        <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary group h-10">
                            View All Activities
                            <ChevronRight className="h-3 w-3 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            )}
        </>
    )
}
