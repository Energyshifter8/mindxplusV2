"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { ContactSupport } from "@/components/shell/ContactSupport";
import { isTokenInvalidOrExpired } from "@/lib/auth";
import { useIsMobileAtMount } from "@/lib/hooks/useClient";
import { isEditorRoute, isParityRoute, ROUTES } from "@/lib/routes";

/**
 * Staging-ийн (dashboard) layout (📦 bundle): antd Layout — Sider + Content
 * (`h-full overflow-y-auto bg-white`). Mobile (≤767px) үед sidebar нуугдана.
 * JWT байхгүй/хугацаа дууссан бол /login.
 *
 * Staging-тэй адил болгож хөрвүүлээгүй хуудсууд хуучин dark хэв маягаараа
 * `.dark` scope дотор харагдана (isParityRoute).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const isMobile = useIsMobileAtMount();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (isTokenInvalidOrExpired(localStorage.getItem("token"))) {
			router.push(ROUTES.login);
		}
	}, [router]);

	const showSidebar = !isEditorRoute(pathname);
	const parity = isParityRoute(pathname);

	return (
		<>
			<div className="flex h-screen min-h-0 flex-row overflow-hidden bg-[#f5f5f5]">
				{showSidebar && (
					<AppSidebar
						isMobile={isMobile}
						isOpen={isOpen}
						setIsOpen={setIsOpen}
					/>
				)}
				<div className="relative flex h-full min-w-0 flex-1 flex-col">
					<main className="h-full min-h-0 flex-auto overflow-y-auto bg-white">
						{parity ? (
							children
						) : (
							<div className="dark min-h-full bg-background font-sans text-base text-foreground">
								{children}
							</div>
						)}
					</main>
				</div>
			</div>
			<ContactSupport />
		</>
	);
}
