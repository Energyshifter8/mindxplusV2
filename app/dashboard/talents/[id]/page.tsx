"use client";

import { useParams } from "next/navigation";
import { TalentDetailView } from "@/components/role-assessment/talents/TalentDetailView";

/** Staging /invited-talents/{talentId} */
export default function TalentDetailPage() {
	const params = useParams<{ id: string }>();
	return <TalentDetailView key={params.id} talentId={params.id ?? ""} />;
}
