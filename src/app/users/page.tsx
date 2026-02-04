import { Metadata } from "next"
import UserManagementClient from "./user-management-client"

export const metadata: Metadata = {
    title: "User Management",
}

export default function UserManagementPage() {
    return <UserManagementClient />
}
