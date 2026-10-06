"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
	MindXLogo,
	NavHomeIcon,
	NavRoleAssessmentIcon,
	NavSurveyIcon,
	NavTemplatesIcon,
	SidebarCollapseIcon,
} from "@/components/icons/staging";
import { UserMenu } from "@/components/shell/UserMenu";
import { daysUntil, useAccountInfo } from "@/lib/hooks/useAccountQueries";
import { useIsClient } from "@/lib/hooks/useClient";
import { type NavKey, navKeyForPath, ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

// Staging-ийн sidebar (antd Layout.Sider, 📦 bundle + DOM хэмжилт, docs/parity/home.md §3).

const ANTD_FONT =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
const COLLAPSED_KEY = "isCollapsed";
const ACTIVE_ITEM =
	"bg-Primary-softBg shadow-[0_0_0_2px_#fbfcfe,0_0_0_4px_#cbd5e1]";

interface NavItem {
	key: NavKey;
	label: string;
	href: string;
	icon: React.ReactNode;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
	{
		title: "Нүүр",
		items: [
			{
				key: "home",
				label: "Нүүр хуудас",
				href: ROUTES.home,
				icon: <NavHomeIcon />,
			},
		],
	},
	{
		title: "Шинжилгээ",
		items: [
			{
				key: "templates",
				label: "Шинжилгээ үүсгэх",
				href: ROUTES.templates,
				icon: <NavTemplatesIcon />,
			},
			{
				key: "survey",
				label: "Миний шинжилгээ",
				href: ROUTES.survey,
				icon: <NavSurveyIcon />,
			},
		],
	},
	{
		title: "Талентийн үнэлгээ",
		items: [
			{
				key: "role-assessment",
				label: "Талентийн үнэлгээ үүсгэх",
				href: ROUTES.roleAssessment,
				icon: <NavRoleAssessmentIcon />,
			},
			{
				key: "role-assessment-invited",
				label: "Миний урьсан талентууд",
				href: ROUTES.invitedTalents,
				icon: (
					<User
						className="size-4 shrink-0 text-TextColor-main"
						strokeWidth={1.5}
						aria-hidden
					/>
				),
			},
		],
	},
];

/** Staging: орчин staging үед sidebar-т харагддаг banner. */
function StagingBanner() {
	if (!process.env.NEXT_PUBLIC_API_URL?.includes("staging")) return null;
	return (
		<div className="px-4 py-1">
			<p className="rounded-md bg-[#fecaca] px-2 py-[6px] font-medium text-[#dc2626] text-[14px]">
				Working on staging
			</p>
		</div>
	);
}

/** antd Alert (warning/error, `!p-2`) — staging sidebar-ын багцын анхааруулга. */
function PlanAlert({
	type,
	message,
}: {
	type: "warning" | "error";
	message: string;
}) {
	return (
		<div
			role="alert"
			className={cn(
				"flex items-center rounded-lg border p-2 text-[14px] text-[rgba(0,0,0,0.88)] leading-[1.5714]",
				type === "error"
					? "border-[#ffccc7] bg-[#fff2f0]"
					: "border-[#ffe58f] bg-[#fffbe6]",
			)}
		>
			<div className="min-w-0 flex-1">{message}</div>
		</div>
	);
}

interface AppSidebarProps {
	isMobile: boolean;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

function readCollapsed(): boolean {
	try {
		const stored = localStorage.getItem(COLLAPSED_KEY);
		return stored ? JSON.parse(stored) === true : false;
	} catch {
		// localStorage уншигдахгүй бол анхдагч (дэлгэсэн)
		return false;
	}
}

export function AppSidebar(props: AppSidebarProps) {
	// Staging: Sider-ийг mount болсны дараа л render хийнэ (localStorage-аас уншдаг)
	const isClient = useIsClient();
	return isClient ? <SidebarContent {...props} /> : null;
}

function SidebarContent({ isMobile, isOpen, setIsOpen }: AppSidebarProps) {
	const pathname = usePathname();
	const activeKey = navKeyForPath(pathname);
	const account = useAccountInfo();
	const [collapsed, setCollapsed] = useState(readCollapsed);

	const toggleCollapsed = () => {
		const next = !collapsed;
		setCollapsed(next);
		localStorage.setItem(COLLAPSED_KEY, String(next));
	};
	const closeMobile = () => setIsOpen(false);
	const daysLeft = daysUntil(account?.dueDate);
	const width = collapsed ? 70 : isMobile ? "100vw" : 260;

	return (
		<aside
			className={cn(
				"relative h-screen shrink-0 overflow-hidden border border-Stroke-600 transition-all duration-200",
				isMobile ? "fixed top-0 left-0 z-50" : "block",
				isMobile && !isOpen ? "hidden" : "block",
			)}
			style={{
				width,
				minWidth: width,
				maxWidth: width,
				flex: `0 0 ${typeof width === "number" ? `${width}px` : width}`,
				backgroundColor: "#f5f5f5",
				fontFamily: ANTD_FONT,
				fontSize: 14,
				lineHeight: 1.5,
				letterSpacing: "0.2px",
				color: "#000",
			}}
		>
			<div className="h-full">
				<div className="flex h-full w-full flex-col bg-[#fbfcfe] font-sf text-TextColor-main">
					<div
						className={cn(
							"flex h-14 items-center py-3",
							collapsed ? "justify-center px-0" : "justify-between px-5",
						)}
					>
						<Link href={ROUTES.home} aria-label="Нүүр хуудас">
							<MindXLogo className={collapsed ? "hidden" : undefined} />
						</Link>
						<button
							type="button"
							onClick={toggleCollapsed}
							aria-label={collapsed ? "Цэс дэлгэх" : "Цэс хураах"}
							className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded hover:bg-[#f3f4f6] md:flex"
						>
							<SidebarCollapseIcon
								className={collapsed ? "rotate-180" : undefined}
							/>
						</button>
					</div>

					{!collapsed && <StagingBanner />}

					<div className="flex min-h-0 flex-1 flex-col justify-between">
						<nav
							aria-label="Үндсэн цэс"
							className={cn(
								"mt-0 flex w-full flex-col gap-2",
								collapsed && "px-2",
							)}
						>
							{collapsed ? (
								<div className="flex flex-col items-center gap-2 py-3">
									{NAV_GROUPS.flatMap((g) => g.items).map((item) => (
										<Link
											key={item.key}
											href={item.href}
											title={item.label}
											aria-label={item.label}
											onClick={closeMobile}
											className={cn(
												"flex size-10 items-center justify-center rounded-[4px] text-TextColor-main transition-colors [&_svg]:size-4",
												activeKey === item.key
													? ACTIVE_ITEM
													: "hover:bg-Ghost-150",
											)}
										>
											{item.icon}
										</Link>
									))}
								</div>
							) : (
								NAV_GROUPS.map((group) => (
									<div
										key={group.title}
										className="flex w-full flex-col gap-2 px-4 py-2"
									>
										<div className="flex min-w-[128px] items-center gap-2 px-2 py-1.5">
											<p className="flex-1 font-medium font-sf text-TextColor-third text-xs leading-[1.4] tracking-[0.2px]">
												{group.title}
											</p>
										</div>
										<div className="flex w-full flex-col gap-2">
											{group.items.map((item) => (
												<Link
													key={item.key}
													href={item.href}
													onClick={closeMobile}
													aria-current={
														activeKey === item.key ? "page" : undefined
													}
													className={cn(
														"flex min-w-[128px] items-center gap-2 overflow-hidden rounded-[4px] px-2 py-1.5 font-medium font-sf text-TextColor-main text-sm leading-[1.4] tracking-[0.2px] transition-colors [&_svg]:size-4",
														activeKey === item.key
															? ACTIVE_ITEM
															: "hover:bg-Ghost-150",
													)}
												>
													{item.icon}
													<span className="min-h-px min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
														{item.label}
													</span>
												</Link>
											))}
										</div>
									</div>
								))
							)}
						</nav>

						<div
							className={cn(
								collapsed ? "hidden" : "flex",
								"mb-5 flex-col gap-y-[10px] px-[20px]",
							)}
						>
							{account?.expired ? (
								<PlanAlert
									type="error"
									message="Таны багцын хугацаа дууссан байна."
								/>
							) : (
								daysLeft <= 10 && (
									<PlanAlert
										type="warning"
										message={`Таны багцын хугацаа дуусахад ${daysLeft} хоног үлдсэн байна`}
									/>
								)
							)}
							<UserMenu />
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
}
