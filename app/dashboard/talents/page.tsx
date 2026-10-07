"use client";

import { Suspense } from "react";
import { InvitedTalentsList } from "@/components/role-assessment/talents/InvitedTalentsList";

/** Staging /invited-talents */
export default function InvitedTalentsPage() {
	return (
		<Suspense>
			<InvitedTalentsList />
		</Suspense>
	);
}
