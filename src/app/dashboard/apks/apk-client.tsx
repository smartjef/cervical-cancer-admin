"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { uploadAPK, deleteAPK, toggleApkStatus } from "@/lib/apk-actions"
import { Download, Trash2, Upload, FileIcon, Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import DashboardShell from "@/components/dashboard-shell"

interface ApkInfo {
    id: string
    filename: string
    version: string
    size: string
    isActive: boolean
    createdAt: string
    notes?: string
}

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function ApkClient({ initialApks }: { initialApks: ApkInfo[] }) {
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState<string | null>(null)
    const [toggling, setToggling] = useState<string | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const file = formData.get("file") as File
        const version = formData.get("version") as string

        if (!file || !file.name.endsWith(".apk")) {
            toast({
                title: "Invalid file",
                description: "Please select a valid .apk file",
                variant: "destructive"
            })
            return
        }

        if (!version) {
            toast({
                title: "Version required",
                description: "Please enter a version number",
                variant: "destructive"
            })
            return
        }

        setUploading(true)
        try {
            await uploadAPK(formData)
            toast({
                title: "Success",
                description: "APK uploaded successfully",
                variant: "success"
            })
            router.refresh();
            (e.target as HTMLFormElement).reset()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to upload APK",
                variant: "destructive"
            })
        } finally {
            setUploading(false)
        }
    }

    async function handleDelete(id: string, filename: string) {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return
        setDeleting(id)
        try {
            await deleteAPK(id)
            toast({
                title: "Success",
                description: "APK deleted successfully",
                variant: "success"
            })
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete APK",
                variant: "destructive"
            })
        } finally {
            setDeleting(null)
        }
    }

    async function handleToggle(id: string) {
        setToggling(id)
        try {
            await toggleApkStatus(id)
            router.refresh()
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update status",
                variant: "destructive"
            })
        } finally {
            setToggling(null)
        }
    }

    return (
        <DashboardShell title="App Management" subtitle="SCREEN-IT">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">App Management</h2>
                    <p className="text-sm text-muted-foreground font-medium">Manage and release new APK versions</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
            <Card className="lg:col-span-2 h-fit">
                <CardHeader>
                    <CardTitle className="text-xl">Upload Version</CardTitle>
                    <CardDescription>
                        Release a new APK version.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpload} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Version</label>
                            <Input
                                name="version"
                                placeholder="1.0.0"
                                disabled={uploading}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Notes</label>
                            <Input
                                name="notes"
                                placeholder="Release notes..."
                                disabled={uploading}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">APK File</label>
                            <Input
                                name="file"
                                type="file"
                                accept=".apk"
                                disabled={uploading}
                                className="cursor-pointer"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={uploading} className="w-full">
                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            {uploading ? "Uploading..." : "Upload APK"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="lg:col-span-5">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Version History</CardTitle>
                        <CardDescription>
                            Manage all uploaded app versions.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[100px]">Version</TableHead>
                                    <TableHead>Filename</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {initialApks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                            No versions uploaded yet.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    initialApks.map((apk) => (
                                        <TableRow key={apk.id}>
                                            <TableCell className="font-bold text-primary">
                                                v{apk.version}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate font-medium">
                                                {apk.filename}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {apk.size}
                                            </TableCell>
                                            <TableCell>
                                                <Badge 
                                                    variant={apk.isActive ? "success" : "secondary"}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => handleToggle(apk.id)}
                                                >
                                                    {toggling === apk.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                    ) : apk.isActive ? (
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                    )}
                                                    {apk.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">
                                                {new Date(apk.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                                                        <a href={`${process.env.NEXT_PUBLIC_APK_BASE_URL}/api/apks/download/${apk.filename}`} download title="Download">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        disabled={deleting === apk.id}
                                                        onClick={() => handleDelete(apk.id, apk.filename)}
                                                        title="Delete"
                                                    >
                                                        {deleting === apk.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
        </DashboardShell>
    )
}


