"use client"

import { useState } from "react"
import { Shield, Lock, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { apiRequest } from "@/lib/api"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await apiRequest("/auth/sign-in/username", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            })
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message || "Invalid credentials")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F4F4] p-4">
            <div className="mb-8 flex flex-col items-center">
                <div className="bg-white px-6 py-2 text-sm font-bold tracking-widest text-emerald-900 border border-gray-100 mb-6 uppercase italic">
                    Pearl Hospital
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Admin Login</h1>
                <p className="text-gray-500 font-medium tracking-tight">Cervical Cancer Screening Program</p>
            </div>

            <Card className="w-full max-w-md border-none">
                <CardContent className="pt-10 pb-12 px-8">
                    <div className="flex items-center justify-center gap-2 mb-10">
                        <Shield className="h-6 w-6 text-gray-700" />
                        <h2 className="text-xl font-bold text-gray-700">Secure Access</h2>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 block">Username</label>
                            <Input
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="h-12 bg-white border-gray-200 focus-visible:ring-emerald-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-600 block">Password</label>
                            <Input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 bg-white border-gray-200 focus-visible:ring-emerald-500"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-all mt-4"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Login to Dashboard"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
