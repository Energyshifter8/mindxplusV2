"use client";

import { useParams } from "next/navigation";
import { RoleAssessmentWizard } from "@/components/role-assessment/wizard/RoleAssessmentWizard";

// Staging /role-assessment/{id} — sidebar-гүй wizard (components/SidebarGate.tsx).
export default function RecruitmentWizardPage() {
	const params = useParams<{ id: string }>();
	return <RoleAssessmentWizard key={params.id} recruitmentId={params.id} />;
}
