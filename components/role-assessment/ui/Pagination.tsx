"use client";

import {
	PageFirstIcon,
	PagePrevIcon,
} from "@/components/icons/role-assessment";
import { PAGE_SIZE_OPTIONS } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { RaSelect } from "./Select";

// Staging хуудаслалт (📦 module 51960): "Хуудас X / Y", « ‹ › », хуудасны хэмжээ.

function PageButton({
	label,
	disabled,
	onClick,
	rotate,
	children,
}: {
	label: string;
	disabled: boolean;
	onClick: () => void;
	rotate?: boolean;
	children: React.ReactNode;
}) {
	return (
		<li>
			<button
				type="button"
				aria-label={label}
				disabled={disabled}
				onClick={onClick}
				className={cn(
					"inline-flex size-9 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40 [&_svg]:size-4",
					rotate && "rotate-180",
					disabled
						? "pointer-events-none border-Stroke-500 text-TextColor-disable"
						: "cursor-pointer border-Stroke-700 text-TextColor-main hover:border-Stroke-800 hover:bg-Ghost-150",
				)}
			>
				{children}
			</button>
		</li>
	);
}

export function RaPagination({
	currentPage,
	totalPages,
	onPageChange,
	pageSize,
	onPageSizeChange,
	className,
}: {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	pageSize?: number;
	onPageSizeChange?: (size: number) => void;
	className?: string;
}) {
	const isFirst = currentPage <= 1;
	const isLast = currentPage >= totalPages;
	return (
		<nav
			aria-label="Хуудаслалт"
			className={cn(
				"mx-auto flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-6",
				className,
			)}
		>
			<div className="text-center font-semibold text-TextColor-main text-sm leading-5 sm:text-left sm:text-base">
				Хуудас {currentPage} / {totalPages}
			</div>
			<ul className="flex flex-row items-center gap-2">
				<PageButton
					label="Эхний хуудас"
					disabled={isFirst}
					onClick={() => onPageChange(1)}
				>
					<PageFirstIcon />
				</PageButton>
				<PageButton
					label="Өмнөх хуудас"
					disabled={isFirst}
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
				>
					<PagePrevIcon />
				</PageButton>
				<PageButton
					label="Дараагийн хуудас"
					disabled={isLast}
					rotate
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
				>
					<PagePrevIcon />
				</PageButton>
				<PageButton
					label="Сүүлийн хуудас"
					disabled={isLast}
					rotate
					onClick={() => onPageChange(totalPages)}
				>
					<PageFirstIcon />
				</PageButton>
			</ul>
			{pageSize !== undefined && onPageSizeChange && (
				<RaSelect
					ariaLabel="Хуудасны хэмжээ"
					value={String(pageSize)}
					onChange={(v) => onPageSizeChange(Number(v))}
					options={PAGE_SIZE_OPTIONS.map((n) => ({
						value: String(n),
						label: n,
					}))}
					triggerClassName="h-9 w-[82px] rounded-lg border border-Stroke-700 bg-white px-3 font-medium text-[14px] text-TextColor-main transition-colors hover:border-Stroke-800 hover:bg-Ghost-150"
					popupClassName="!min-w-[72px]"
				/>
			)}
		</nav>
	);
}
