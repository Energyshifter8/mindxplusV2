"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

const MONO = { fontFamily: "'JetBrains Mono', monospace" } as const;
const CONDENSED = { fontFamily: "'Barlow Condensed', sans-serif" } as const;

interface DrawerProps {
	title: string;
	eyebrow?: string;
	onClose: () => void;
	children: React.ReactNode;
	/** Tailwind max-width класс */
	widthClass?: string;
}

/** Баруун талаас гарч ирэх самбар (backdrop дээр дарах эсвэл Escape → хаана). */
export function Drawer({
	title,
	eyebrow,
	onClose,
	children,
	widthClass = "max-w-lg",
}: DrawerProps) {
	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: drawer backdrop (Escape-ийг document дээр сонсоно)
		// biome-ignore lint/a11y/noStaticElementInteractions: drawer backdrop
		<div
			className="fixed inset-0 z-50 flex justify-end bg-black/70"
			onClick={onClose}
		>
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: drawer content */}
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className={`relative flex h-full w-full ${widthClass} flex-col border-l-2 border-border bg-card`}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-start justify-between gap-3 border-b-2 border-border p-5">
					<div className="min-w-0">
						{eyebrow && (
							<p
								className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground"
								style={MONO}
							>
								{eyebrow}
							</p>
						)}
						<h2
							className="truncate text-xl font-black uppercase leading-tight text-foreground"
							style={CONDENSED}
						>
							{title}
						</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Хаах"
						className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
					>
						<X size={16} />
					</button>
				</div>

				<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
					{children}
				</div>
			</div>
		</div>
	);
}
