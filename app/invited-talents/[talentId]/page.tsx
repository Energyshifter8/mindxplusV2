"use client";

import { useParams } from "next/navigation";
import { TalentDetailView } from "@/components/role-assessment/talents/TalentDetailView";

/** Staging /invited-talents/{talentId} */
export default function TalentDetailPage() {
	const params = useParams<{ talentId: string }>();
	return (
		<TalentDetailView key={params.talentId} talentId={params.talentId ?? ""} />
	);
}
