import SystemUserDetailClient from "./system-user-detail-client"

export default async function ChpDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <SystemUserDetailClient id={id} />
}
