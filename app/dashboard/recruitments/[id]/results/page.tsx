"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import { RecruitmentDashboard } from "@/components/role-assessment/dashboard/RecruitmentDashboard";

/** Staging /role-assessment/{id}/dashboard */
export default function RecruitmentDashboardPage() {
	const params = useParams<{ id: string }>();
	return (
		<Suspense>
			<RecruitmentDashboard key={params.id} recruitmentId={params.id} />
		</Suspense>
	);
}
