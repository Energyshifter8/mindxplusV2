import SidebarGate from "@/components/SidebarGate";

/** Sidebar-тай апп-ын shell: /dashboard, /role-assessment, /invited-talents. */
export function DashboardShell({ children }: { children: React.ReactNode }) {
	return (
		<SidebarGate
			user={{ name: "Хэрэглэгч", email: "user@example.com" }}
			warningMessage="Таны багцын хугацаа дуусах гэж байна."
		>
			{children}
		</SidebarGate>
	);
}
