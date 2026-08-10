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
import MindXLogo from "@/components/shared/MindXLogo";
import { cn } from "@/lib/utils";

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
			<div className="flex items-center px-5 py-5">
				<MindXLogo size="sm" />
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
