import { Metadata } from "next"
import ProfileClient from "./profile-client"

export const metadata: Metadata = {
    title: "User Profile",
}

export default function ProfilePage() {
    return <ProfileClient />
}
