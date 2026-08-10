"use client";

import { MoreVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface KebabMenuItem {
	label: string;
	icon?: React.ReactNode;
	onClick: () => void;
	variant?: "default" | "destructive";
}

export function KebabMenu({ items }: { items: KebabMenuItem[] }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const handleClickOutside = useCallback((e: MouseEvent) => {
		if (ref.current && !ref.current.contains(e.target as Node)) {
			setOpen(false);
		}
	}, []);

	const handleKeyDown = useCallback((e: KeyboardEvent) => {
		if (e.key === "Escape") {
			setOpen(false);
		}
	}, []);

	useEffect(() => {
		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleKeyDown);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
				document.removeEventListener("keydown", handleKeyDown);
			};
		}
	}, [open, handleClickOutside, handleKeyDown]);

	if (items.length === 0) return null;

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
				title="Нэмэлт үйлдэл"
			>
				<MoreVertical size={13} />
			</button>
			{open && (
				<div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] border-2 border-border bg-card shadow-md">
					{items.map((item) => (
						<button
							key={item.label}
							type="button"
							onClick={() => {
								item.onClick();
								setOpen(false);
							}}
							className={`flex items-center gap-2 w-full px-3 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors text-left ${
								item.variant === "destructive"
									? "text-destructive hover:bg-destructive/10"
									: "text-foreground hover:bg-muted"
							}`}
							style={{ fontFamily: "'JetBrains Mono', monospace" }}
						>
							{item.icon}
							{item.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
