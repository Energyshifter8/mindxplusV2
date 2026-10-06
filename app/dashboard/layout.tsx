import SidebarGate from "@/components/SidebarGate";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarGate
			user={{ name: "Хэрэглэгч", email: "user@example.com" }}
			warningMessage="Таны багцын хугацаа дуусах гэж байна."
		>
			{children}
		</SidebarGate>
	);
}
