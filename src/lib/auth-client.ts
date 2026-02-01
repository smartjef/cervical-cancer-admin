import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api") + "/auth",
    fetchOptions: {
        credentials: "include"
    }
})

export const { signIn, signUp, useSession, signOut } = authClient
