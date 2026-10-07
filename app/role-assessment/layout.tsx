import { DashboardShell } from "@/components/DashboardShell";
import { RaScope } from "@/components/role-assessment/RaScope";

// Staging-ийн замтай ижил (/role-assessment…, /invited-talents…); хуучин /dashboard/…
// замуудыг next.config.ts-ийн redirects() шилжүүлнэ.
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
