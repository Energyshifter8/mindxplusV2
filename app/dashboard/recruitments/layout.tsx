import { RaScope } from "@/components/role-assessment/RaScope";

export default function RoleAssessmentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <RaScope>{children}</RaScope>;
}
