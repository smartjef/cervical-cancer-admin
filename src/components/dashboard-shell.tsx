"use client"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

const segmentLabel: Record<string, string> = {
  "users": "Users",
  "clients": "Clients",
  "dashboard": "Dashboard",
  "screening": "Screening",
  "facilities": "Facilities",
  "referrals": "Referrals",
  "follow-ups": "Follow-ups",
  "reports": "Reports",
  "apks": "App Management",
  "activities": "Activities",
  "profile": "Profile",
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  const pathname = usePathname()
  const pathSegments = pathname.split("/").filter(Boolean)

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background transition-colors duration-300 overflow-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <AppHeader title={title} subtitle={subtitle} />
          <main className="flex-1 overflow-y-auto">
            {/* Breadcrumb */}
            <div className="px-6 md:px-8 pt-5 pb-1 flex items-center gap-1.5 text-xs">
              <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                <Home className="h-3 w-3" />
              </Link>
              {pathSegments.map((segment, index) => (
                <div key={segment} className="flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                  <span
                    className={`capitalize font-medium ${
                      index === pathSegments.length - 1
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-primary transition-colors"
                    }`}
                  >
                    {segmentLabel[segment] || segment.replace(/-/g, " ")}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 md:p-6 lg:p-8 pt-4">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
