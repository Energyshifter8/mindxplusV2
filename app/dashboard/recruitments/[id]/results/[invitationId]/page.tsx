"use client";

import { useParams } from "next/navigation";
import { InvitationResultView } from "@/components/role-assessment/result/InvitationResultView";

/** Staging /role-assessment/{id}/dashboard/{invitationId} */
export default function InvitationResultPage() {
	const params = useParams<{ id: string; invitationId: string }>();
	return (
		<InvitationResultView
			key={params.invitationId}
			recruitmentId={params.id}
			invitationId={params.invitationId}
		/>
	);
}
