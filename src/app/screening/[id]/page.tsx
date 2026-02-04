import ScreeningDetailClient from "./screening-detail-client"

export default async function ScreeningDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ScreeningDetailClient id={id} />
}
