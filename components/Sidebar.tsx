"use client";

import {
	AlertTriangle,
	ChevronDown,
	FilePlus,
	Home,
	ListChecks,
	Moon,
	Sun,
	User,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function SidebarLogo() {
	return (
		<svg width="130" height="36" viewBox="0 0 160 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="mindX+ logo">
			<path d="M0 32V12.8h4.2l5.8 13.6L15.8 12.8H20V32h-3.8V17.4L11.2 32H8.8L3.8 17.4V32H0Z" fill="#1a1f36" />
			<path d="M22.4 32V12.8h7.6c3.4 0 5.8 2 5.8 4.8 0 2.2-1.2 3.8-3 4.4 2.2.4 3.6 2.2 3.6 4.6 0 3-2.6 5.4-6.2 5.4H22.4Zm3.8-9.2h3.4c1.4 0 2.2-.8 2.2-2s-.8-2-2.2-2h-3.4v4Zm0 7.6h3.8c1.6 0 2.4-1 2.4-2.2 0-1.2-.8-2.2-2.4-2.2h-3.8v4.4Z" fill="#1a1f36" />
			<path d="M37.2 32V12.8h3.8v15.6h8.4v3.2h-12.2Z" fill="#1a1f36" />
			<path d="M51.2 32V12.8h7.6c3.4 0 5.8 2 5.8 4.8 0 2.2-1.2 3.8-3 4.4 2.2.4 3.6 2.2 3.6 4.6 0 3-2.6 5.4-6.2 5.4H51.2Zm3.8-9.2h3.4c1.4 0 2.2-.8 2.2-2s-.8-2-2.2-2h-3.4v4Zm0 7.6h3.8c1.6 0 2.4-1 2.4-2.2 0-1.2-.8-2.2-2.4-2.2h-3.8v4.4Z" fill="#1a1f36" />
			<path d="M70.4 12.8L77.6 20l7.2-7.2h4.8L82.8 20.8 90.4 32h-5l-5.6-8.4L74.4 32h-4.8l5.6-8.4L66 12.8h4.4Z" fill="#1a1f36" />
			<circle cx="74" cy="10" r="3.5" fill="#e53e3e" />
			<circle cx="86" cy="10" r="3.5" fill="#dd6b20" />
			<circle cx="74" cy="34" r="3.5" fill="#3182ce" />
			<circle cx="86" cy="34" r="3.5" fill="#38a169" />
			<path d="M98 20v-8h3v8h8v3h-8v8h-3v-8h-8v-3h8Z" fill="#1a1f36" />
		</svg>
	);
}

interface SidebarProps {
	warningMessage?: string;
	user: { name: string; email: string };
}

interface NavItem {
	label: string;
	href: string;
	icon: React.ElementType;
}

const navSections: { title: string; items: NavItem[] }[] = [
	{
		title: "Нүүр",
		items: [{ label: "Нүүр хуудас", href: "/dashboard", icon: Home }],
	},
	{
		title: "Шинжилгээ",
		items: [
			{
				label: "Шинжилгээ үүсгэх",
				href: "/dashboard/surveys/new",
				icon: FilePlus,
			},
			{
				label: "Миний шинжилгээ",
				href: "/dashboard/surveys",
				icon: ListChecks,
			},
		],
	},
	{
		title: "Талентийн үнэлгээ",
		items: [
			{
				label: "Талентийн үнэлгээ",
				href: "/dashboard/recruitments",
				icon: Users,
			},
			{
				label: "Миний урьсан талентууд",
				href: "/dashboard/talents",
				icon: User,
			},
		],
	},
];

function SidebarItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
	const Icon = item.icon;
	return (
		<Link
			href={item.href}
			className={cn(
				"flex items-center gap-3 px-3 py-2 text-xs uppercase tracking-widest transition-colors duration-150 border-l-2 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
				isActive
					? "border-primary bg-primary/10 text-foreground font-medium"
					: "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
			)}
			style={{ fontFamily: "'JetBrains Mono', monospace" }}
		>
			<Icon
				size={16}
				className={cn(isActive ? "text-primary" : "text-muted-foreground")}
			/>
			<span>{item.label}</span>
		</Link>
	);
}

export default function Sidebar({ warningMessage, user }: SidebarProps) {
	const pathname = usePathname();
	const { theme, setTheme } = useTheme();
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const initials = user.name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);

	return (
		<aside className="flex h-screen w-[272px] flex-col border-r-2 border-border bg-card text-foreground">
			{/* Workspace / Logo */}
			<div className="flex items-center px-5 py-4">
				<SidebarLogo />
			</div>

			{/* Navigation sections */}
			<nav className="flex-1 overflow-y-auto px-3 py-1">
				{navSections.map((section) => (
					<div key={section.title} className="mb-4">
						<p
							className="mb-1.5 px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							{section.title}
						</p>
						<ul className="space-y-0.5">
							{section.items.map((item) => (
								<li key={item.href}>
									<SidebarItem item={item} isActive={pathname === item.href} />
								</li>
							))}
						</ul>
					</div>
				))}
			</nav>

			{/* Theme toggle */}
			<div className="px-3 mb-2">
				{mounted ? (
					<button
						type="button"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="flex w-full items-center gap-3 px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
						<span>{theme === "dark" ? "Цагаан" : "Харанхуй"}</span>
					</button>
				) : (
					<div
						className="flex w-full items-center gap-3 px-3 py-2 text-xs uppercase tracking-widest text-transparent"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						<div className="h-4 w-4" />
						<span>placeholder</span>
					</div>
				)}
			</div>

			{/* Warning banner */}
			{warningMessage && (
				<div
					className="mx-3 mb-3 flex items-start gap-2.5 border border-amber-500/30 px-3 py-3"
					style={{ borderRadius: 0 }}
				>
					<AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
					<p
						className="text-[10px] uppercase tracking-widest leading-relaxed text-amber-300"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{warningMessage}
					</p>
				</div>
			)}

			{/* Account row */}
			<button
				type="button"
				className="flex items-center gap-3 border-t-2 border-border px-5 py-4 text-left transition-colors duration-150 hover:bg-secondary/50 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
			>
				<div
					className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary text-[10px] font-bold text-primary"
					style={{ fontFamily: "'JetBrains Mono', monospace" }}
				>
					{initials}
				</div>
				<div className="min-w-0 flex-1">
					<p
						className="text-xs font-medium uppercase tracking-widest text-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						Миний бүртгэл
					</p>
					<p
						className="truncate text-[10px] text-muted-foreground"
						style={{ fontFamily: "'JetBrains Mono', monospace" }}
					>
						{user.email}
					</p>
				</div>
				<ChevronDown size={14} className="shrink-0 text-muted-foreground" />
			</button>
		</aside>
	);
}
