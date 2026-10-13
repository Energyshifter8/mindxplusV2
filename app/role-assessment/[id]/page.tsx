"use client";

import { useParams } from "next/navigation";
import { RoleAssessmentWizard } from "@/components/role-assessment/wizard/RoleAssessmentWizard";

export default function RecruitmentWizardPage() {
	const params = useParams<{ id: string }>();
	return <RoleAssessmentWizard key={params.id} recruitmentId={params.id} />;
}
