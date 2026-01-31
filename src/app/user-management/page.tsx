import { useState } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/combobox"
import {
    Users,
    UserPlus,
    Search,
    UserCheck,
    ShieldCheck,
    MonitorDot,
    MapPin,
    Phone,
    Calendar,
    Edit3,
    PauseCircle,
    Trash2
} from "lucide-react"

const stats = [
    { title: "CHPs", value: "2", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Clients", value: "3", icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Admins", value: "1", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Active Users", value: "6", icon: MonitorDot, color: "text-cyan-600", bg: "bg-cyan-50" },
]

const users = [
    {
        name: "Jane Wanjiku",
        role: "CHP",
        status: "Active",
        location: "Kibera Sub-county",
        phone: "+254788765432",
        lastActive: "Aug 30, 2025",
        performance: "92%",
        color: "emerald"
    },
    {
        name: "Grace Wambui",
        role: "Client",
        status: "Active",
        risk: "High Risk",
        location: "Kibera Sub-county",
        phone: "+254733456789",
        lastActive: "Jun 20, 2025",
        color: "blue"
    },
    {
        name: "Dr. Peter Kamau",
        role: "Admin",
        status: "Active",
        location: "Pearl Hospital",
        phone: "+254700987654",
        lastActive: "Now",
        color: "amber"
    }
]

export default function UserManagementPage() {
    const [roleFilter, setRoleFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")

    return (
        <DashboardShell title="User Management" subtitle="Pearl Hospital">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                    <p className="text-sm text-gray-500 font-medium">6 total users across all roles</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2 font-bold h-11">
                    <UserPlus className="h-5 w-5" />
                    Add New User
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat) => (
                    <Card key={stat.title} className="border-none">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl font-bold text-gray-800">{stat.value}</span>
                                <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                            </div>
                            <p className="text-lg font-bold text-gray-700">{stat.title}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name or phone"
                        className="pl-10 h-11 bg-white border-gray-100"
                    />
                </div>
                <div className="flex gap-3">
                    <Combobox
                        options={[
                            { label: "All Roles", value: "all" },
                            { label: "CHPs", value: "chp" },
                            { label: "Clients", value: "client" },
                            { label: "Admins", value: "admin" },
                        ]}
                        value={roleFilter}
                        onValueChange={setRoleFilter}
                        placeholder="All Roles"
                        className="w-[140px] bg-white border-gray-100"
                    />
                    <Combobox
                        options={[
                            { label: "All Status", value: "all" },
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                            { label: "Suspended", value: "suspended" },
                        ]}
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                        placeholder="All Status"
                        className="w-[140px] bg-white border-gray-100"
                    />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-base font-bold text-gray-700">CHP Directory</h3>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hover to see actions</span>
                    </div>
                    {users.map((user) => (
                        <Card key={user.name} className="border-none group overflow-hidden transition-all hover:bg-emerald-50/20">
                            <CardContent className="p-4 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-gray-800">{user.name}</h4>
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0 leading-none h-4">
                                                    {user.role}
                                                </Badge>
                                                <div className="flex items-center gap-1.5 ml-2">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500"></div>
                                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">{user.status}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 mt-0.5">
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                                                    <MapPin className="h-3 w-3 opacity-60" />
                                                    {user.location}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                                                    <Phone className="h-3 w-3 opacity-60" />
                                                    {user.phone}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-500">
                                                    <Calendar className="h-3 w-3 opacity-60" />
                                                    {user.lastActive}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="hidden group-hover:flex items-center gap-2 transition-all">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50">
                                                <Edit3 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-600 hover:bg-amber-50">
                                                <PauseCircle className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <div className="text-right min-w-[60px]">
                                            {user.performance && (
                                                <>
                                                    <p className="text-sm font-bold text-emerald-600">{user.performance}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tight">Perf.</p>
                                                </>
                                            )}
                                            {user.risk && (
                                                <Badge className="bg-red-50 text-red-700 border-none text-[9px] font-bold h-5 px-2">
                                                    High Risk
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-700">Recent Activity</h3>
                    <Card className="border-none h-fit">
                        <CardContent className="p-6 space-y-6">
                            {[
                                { text: "Jane Wanjiku completed screening for Mary Njeri", time: "2 hours ago", color: "bg-emerald-500" },
                                { text: "High-risk client referral generated", time: "4 hours ago", color: "bg-amber-500" },
                                { text: "New CHP training session scheduled", time: "1 day ago", color: "bg-blue-500" },
                            ].map((activity, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className={`w-2 h-2 rounded-full ${activity.color} shrink-0 mt-1.5`}></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 leading-tight">{activity.text}</p>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardShell>
    )
}
