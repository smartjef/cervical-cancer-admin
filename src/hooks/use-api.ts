import { useState, useEffect, useCallback } from "react"
import { apiRequest } from "@/lib/api"

export function useApi<T>(path: string, options: RequestInit = {}) {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await apiRequest(path, options)
            setData(result)
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching data")
        } finally {
            setIsLoading(false)
        }
    }, [path, JSON.stringify(options)])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, isLoading, error, refetch: fetchData }
}
