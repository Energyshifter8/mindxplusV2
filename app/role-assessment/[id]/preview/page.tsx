"use client";

import { useParams } from "next/navigation";
import { RecruitmentPreview } from "@/components/role-assessment/preview/RecruitmentPreview";

// Staging /role-assessment/{id}/preview — sidebar-гүй (components/SidebarGate.tsx).
export default function RecruitmentPreviewPage() {
	const params = useParams<{ id: string }>();
	return <RecruitmentPreview key={params.id} recruitmentId={params.id} />;
}
