"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

interface SidebarGateProps {
	children: React.ReactNode;
	user: { name: string; email: string };
	warningMessage?: string;
}

export default function SidebarGate({
	children,
	user,
	warningMessage,
}: SidebarGateProps) {
	const pathname = usePathname();
	// Survey editor ба талентийн үнэлгээний wizard/preview (staging `(editor)` бүлэг) sidebar-гүй
	const isEditorPage =
		/^\/dashboard\/surveys\/[^/]+\/edit/.test(pathname) ||
		/^\/dashboard\/recruitments\/[^/]+\/(edit|preview)(\/|$)/.test(pathname);

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			{!isEditorPage && <Sidebar user={user} warningMessage={warningMessage} />}
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
