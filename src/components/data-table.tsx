"use client"

import React from "react"
import {
    ChevronLeft,
    ChevronRight,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Loader2
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"

export interface Column<T> {
    header: string
    accessorKey?: keyof T | string
    cell?: (item: T) => React.ReactNode
    sortable?: boolean
    className?: string
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    isLoading?: boolean
    totalCount?: number
    page: number
    setPage: (page: number) => void
    limit: number
    setLimit: (limit: number) => void
    search?: string
    setSearch?: (search: string) => void
    searchPlaceholder?: string
    sortBy?: string
    setSortBy?: (key: string) => void
    sortOrder?: "asc" | "desc"
    setSortOrder?: (order: "asc" | "desc") => void
    filters?: React.ReactNode
}

export function DataTable<T extends { id: string | number }>({
    columns,
    data,
    isLoading,
    totalCount = 0,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    searchPlaceholder = "Search...",
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filters
}: DataTableProps<T>) {
    const totalPages = Math.ceil(totalCount / limit) || 1

    const handleSort = (key: string) => {
        if (!setSortBy || !setSortOrder) return

        if (sortBy === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(key)
            setSortOrder("desc")
        }
        setPage(1)
    }

    const renderSortIcon = (key: string) => {
        if (sortBy !== key) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        return sortOrder === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        )
    }

    return (
        <div className="space-y-4">
            {/* Table Area */}
            <Card className="border-border/40 shadow-sm bg-card overflow-hidden">
                {/* Header Controls Inside Card */}
                {(setSearch || filters) && (
                    <div className="px-6 py-4 bg-muted/20 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex-1 w-full sm:max-w-xs relative">
                            {setSearch && (
                                <>
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                                    <Input
                                        placeholder={searchPlaceholder}
                                        className="h-10 pl-9 font-medium border-2"
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value)
                                            setPage(1)
                                        }}
                                    />
                                </>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {filters}
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-b-2">
                                {columns.map((column, idx) => (
                                    <TableHead
                                        key={idx}
                                        className={`font-black text-[10px] uppercase tracking-widest ${column.className || ""}`}
                                    >
                                        {column.sortable && column.accessorKey ? (
                                            <button
                                                onClick={() => handleSort(column.accessorKey as string)}
                                                className="flex items-center hover:text-foreground transition-colors uppercase"
                                            >
                                                {column.header}
                                                {renderSortIcon(column.accessorKey as string)}
                                            </button>
                                        ) : (
                                            column.header
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : data.length > 0 ? (
                                data.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-primary/[0.02] border-b transition-colors group">
                                        {columns.map((column, idx) => (
                                            <TableCell key={idx} className={column.className}>
                                                {column.cell
                                                    ? column.cell(item)
                                                    : (item[column.accessorKey as keyof T] as React.ReactNode)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-48 text-center">
                                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest italic">No records found</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Pagination */}
                <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between bg-muted/20 border-t gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Total Records: <span className="text-foreground">{totalCount}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rows per page:</span>
                            <Select value={limit.toString()} onValueChange={(val) => { setLimit(parseInt(val)); setPage(1); }}>
                                <SelectTrigger className="h-8 w-[70px] text-[10px] font-black border-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 15, 25, 50, 100].map((v) => (
                                        <SelectItem key={v} value={v.toString()}>{v}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Page <span className="text-foreground">{page}</span> of <span className="text-foreground">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="h-9 w-9 p-0 border-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="h-9 w-9 p-0 border-2"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
