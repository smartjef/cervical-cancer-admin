"use client"

import DashboardShell from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Smartphone, MapPin, Building } from "lucide-react"

export default function ProfilePage() {
    return (
        <DashboardShell title="My Profile" subtitle="Manage your account settings">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">My Profile</h2>
                <p className="text-sm text-gray-500 font-medium">Manage your personal information and security settings.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="border-none lg:col-span-1 h-fit">
                    <CardHeader className="flex flex-col items-center pb-8 border-b border-gray-100">
                        <Avatar className="h-24 w-24 mb-4 border-4 border-[#F4F4F4]">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl font-bold">PK</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-xl font-bold text-gray-800">Dr. Peter Kamau</CardTitle>
                        <CardDescription className="font-medium text-emerald-600">Administrator</CardDescription>
                        <div className="flex items-center gap-2 mt-4">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">Active Account</span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">p.kamau@pearlhospital.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Smartphone className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">+254 712 345 678</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Building className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Pearl Hospital, Nairobi</span>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-700">Personal Information</CardTitle>
                            <CardDescription>Update your personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Full Name</label>
                                    <Input defaultValue="Dr. Peter Kamau" className="border-none bg-[#F4F4F4] h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Email Address</label>
                                    <Input defaultValue="p.kamau@pearlhospital.com" className="border-none bg-[#F4F4F4] h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Phone Number</label>
                                    <Input defaultValue="+254 712 345 678" className="border-none bg-[#F4F4F4] h-12" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Location</label>
                                    <Input defaultValue="Nairobi, Kenya" className="border-none bg-[#F4F4F4] h-12" />
                                </div>
                            </div>
                            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 px-8">
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-gray-700">Security</CardTitle>
                            <CardDescription>Manage your password and security settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">Current Password</label>
                                    <Input type="password" placeholder="••••••••" className="border-none bg-[#F4F4F4] h-12" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600">New Password</label>
                                        <Input type="password" placeholder="Min. 8 characters" className="border-none bg-[#F4F4F4] h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600">Confirm New Password</label>
                                        <Input type="password" placeholder="Retype new password" className="border-none bg-[#F4F4F4] h-12" />
                                    </div>
                                </div>
                            </div>
                            <Button className="bg-gray-800 hover:bg-gray-900 text-white font-bold h-12 px-8">
                                Update Password
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardShell>
    )
}
