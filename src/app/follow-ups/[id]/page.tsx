import FollowUpDetailClient from "./follow-up-detail-client";

export default async function FollowUpDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FollowUpDetailClient id={id} />;
}
