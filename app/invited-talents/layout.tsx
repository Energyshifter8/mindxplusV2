import { DashboardShell } from "@/components/DashboardShell";
import { RaScope } from "@/components/role-assessment/RaScope";

export default function RoleAssessmentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DashboardShell>
			<RaScope>{children}</RaScope>
		</DashboardShell>
	);
}
