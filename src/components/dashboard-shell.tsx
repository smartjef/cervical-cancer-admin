import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

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
    const pathSegments = pathname.split('/').filter(Boolean)

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
                <AppSidebar />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <AppHeader title={title} subtitle={subtitle} />
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-8 pt-8 flex items-center text-sm font-medium">
                            <span className="text-muted-foreground">Application</span>
                            {pathSegments.map((segment, index) => (
                                <div key={segment} className="flex items-center">
                                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/30" />
                                    <span className={`capitalize ${index === pathSegments.length - 1 ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                                        {segment.replace(/-/g, ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 md:p-8 pt-4">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    )
}
