"use client";

import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
} from "lucide-react";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";

const MONO = { fontFamily: "'JetBrains Mono', monospace" } as const;

const NAV_BUTTON_CLASS =
	"inline-flex h-8 w-8 items-center justify-center border-2 border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-30";

interface PaginatorProps {
	/** 1-ээс эхэлсэн хуудас */
	page: number;
	totalPages: number;
	totalElements: number;
	size: number;
	onPageChange: (page: number) => void;
	onSizeChange: (size: number) => void;
	totalLabel?: string;
	disabled?: boolean;
}

export function Paginator({
	page,
	totalPages,
	totalElements,
	size,
	onPageChange,
	onSizeChange,
	totalLabel = "Нийт",
	disabled,
}: PaginatorProps) {
	const lastPage = Math.max(1, totalPages);
	const canPrev = !disabled && page > 1;
	const canNext = !disabled && page < lastPage;

	return (
		<div className="flex flex-col gap-3 border-t-2 border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
			<div
				className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground"
				style={MONO}
			>
				<span>
					{totalLabel}: <span className="text-foreground">{totalElements}</span>
				</span>
				<label className="flex items-center gap-2">
					<span>Хуудсанд</span>
					<select
						value={size}
						disabled={disabled}
						onChange={(e) => onSizeChange(Number(e.target.value))}
						className="h-8 border-2 border-border bg-card px-2 text-[11px] text-foreground focus:border-primary focus:outline-none"
						style={MONO}
					>
						{PAGE_SIZE_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</label>
			</div>

			<div className="flex items-center gap-1.5">
				<button
					type="button"
					aria-label="Эхний хуудас"
					disabled={!canPrev}
					onClick={() => onPageChange(1)}
					className={NAV_BUTTON_CLASS}
				>
					<ChevronsLeft size={14} />
				</button>
				<button
					type="button"
					aria-label="Өмнөх хуудас"
					disabled={!canPrev}
					onClick={() => onPageChange(page - 1)}
					className={NAV_BUTTON_CLASS}
				>
					<ChevronLeft size={14} />
				</button>
				<span
					className="px-2 text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap"
					style={MONO}
				>
					Хуудас {Math.min(page, lastPage)} / {lastPage}
				</span>
				<button
					type="button"
					aria-label="Дараах хуудас"
					disabled={!canNext}
					onClick={() => onPageChange(page + 1)}
					className={NAV_BUTTON_CLASS}
				>
					<ChevronRight size={14} />
				</button>
				<button
					type="button"
					aria-label="Сүүлийн хуудас"
					disabled={!canNext}
					onClick={() => onPageChange(lastPage)}
					className={NAV_BUTTON_CLASS}
				>
					<ChevronsRight size={14} />
				</button>
			</div>
		</div>
	);
}
