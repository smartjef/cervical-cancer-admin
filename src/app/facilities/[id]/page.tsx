import FacilityDetailClient from "./facility-detail-client";

export default async function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FacilityDetailClient id={id} />;
}
