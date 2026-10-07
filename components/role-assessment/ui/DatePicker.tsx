"use client";

import { Popover } from "@base-ui/react/popover";
import { useId, useState } from "react";
import {
	CalendarIcon,
	ChevronFilledIcon,
} from "@/components/icons/role-assessment";
import { addDaysYmd, formatSlashDate } from "@/lib/format";
import { cn } from "@/lib/utils";

// Staging огноо сонгогч (📦 module 62243, variant "default"): antd Popover (click,
// bottomLeft) дотор 350px календарь, Даваа гаригаас эхэлнэ, `disableDays + 1` хоногоос
// өмнөх өдөр идэвхгүй. Утга "YYYY-MM-DD", харагдац "YYYY/MM/DD".

const WEEKDAYS = ["Да", "Мя", "Лх", "Пү", "Ба", "Бя", "Ня"];
// dayjs "mn" locale-ийн сар (staging bundle ✅)
const MONTHS = [
	"Нэгдүгээр сар",
	"Хоёрдугаар сар",
	"Гуравдугаар сар",
	"Дөрөвдүгээр сар",
	"Тавдугаар сар",
	"Зургадугаар сар",
	"Долдугаар сар",
	"Наймдугаар сар",
	"Есдүгээр сар",
	"Аравдугаар сар",
	"Арван нэгдүгээр сар",
	"Арван хоёрдугаар сар",
];

const pad2 = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) =>
	`${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

function parseYmd(value: string): Date {
	const [y, m, d] = value.split("-").map(Number);
	return new Date(y, (m ?? 1) - 1, d ?? 1);
}

const CELL = "flex h-[45px] w-[45px] items-center justify-center rounded-md";

export function RaDatePicker({
	label,
	value,
	onChange,
	disableDays = 0,
}: {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	disableDays?: number;
}) {
	const labelId = useId();
	const [open, setOpen] = useState(false);
	const [month, setMonth] = useState(() => parseYmd(value || addDaysYmd(1)));
	const minDate = addDaysYmd(disableDays + 1);

	const year = month.getFullYear();
	const monthIndex = month.getMonth();
	const firstWeekday = new Date(year, monthIndex, 1).getDay();
	const leading = firstWeekday === 0 ? 6 : firstWeekday - 1;
	const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
	const prevMonthDays = new Date(year, monthIndex, 0).getDate();
	const used = leading + daysInMonth;
	const trailing = used <= 35 ? 35 - used : 42 - used;

	const shiftMonth = (delta: number) =>
		setMonth(new Date(year, monthIndex + delta, 1));

	return (
		<div className="w-full">
			{label && (
				<p
					id={labelId}
					className="mb-1 font-sf font-semibold text-[14px] text-TextColor-main leading-[140%]"
				>
					{label}
				</p>
			)}
			<Popover.Root
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (next && value) setMonth(parseYmd(value));
				}}
			>
				<Popover.Trigger
					aria-labelledby={label ? labelId : undefined}
					className={cn(
						"flex h-[42px] w-full cursor-pointer items-center rounded-md border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40",
						open
							? "border-Primary"
							: "border-[#CBD5E1] bg-white hover:border-Stroke-700",
					)}
				>
					<span
						className={cn(
							"flex-1 bg-transparent font-medium text-[16px]",
							value ? "text-TextColor-main" : "text-TextColor-third",
						)}
					>
						{formatSlashDate(value) || "YYYY/MM/DD"}
					</span>
					<CalendarIcon className="h-5 w-5 flex-shrink-0 text-TextColor-third" />
				</Popover.Trigger>
				<Popover.Portal>
					<Popover.Positioner
						side="bottom"
						align="start"
						sideOffset={8}
						className="z-[1060]"
					>
						<Popover.Popup className="ra-scope rounded-lg bg-white p-3 shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)] outline-none transition-opacity duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0">
							<div className="w-[350px] max-w-[calc(100vw-56px)] rounded-lg border border-Stroke-500 bg-white p-4">
								<div className="mb-4 flex w-full items-center justify-between px-1">
									<button
										type="button"
										onClick={() => shiftMonth(-1)}
										className="rotate-90 rounded p-1 hover:bg-gray-100"
										aria-label="Өмнөх сар"
									>
										<ChevronFilledIcon className="text-[#292D32]" />
									</button>
									<div className="font-medium" aria-live="polite">
										{MONTHS[monthIndex]} {year}
									</div>
									<button
										type="button"
										onClick={() => shiftMonth(1)}
										className="-rotate-90 rounded p-1 hover:bg-gray-100"
										aria-label="Дараагийн сар"
									>
										<ChevronFilledIcon className="text-[#292D32]" />
									</button>
								</div>
								<div className="mb-2 grid grid-cols-7 gap-1 text-center">
									{WEEKDAYS.map((d) => (
										<div key={d} className="font-medium text-gray-500 text-sm">
											{d}
										</div>
									))}
								</div>
								<div className="grid grid-cols-7 gap-1">
									{Array.from({ length: leading }, (_, i) => {
										const day = prevMonthDays - leading + i + 1;
										return (
											<div
												key={`prev-${day}`}
												className={cn(CELL, "cursor-default text-gray-400")}
											>
												{day}
											</div>
										);
									})}
									{Array.from({ length: daysInMonth }, (_, i) => {
										const day = i + 1;
										const key = ymd(new Date(year, monthIndex, day));
										const disabled = key < minDate;
										const selected = key === value;
										return (
											<button
												key={key}
												type="button"
												disabled={disabled}
												aria-pressed={selected}
												aria-label={key}
												onClick={() => {
													onChange(key);
													setOpen(false);
												}}
												className={cn(
													CELL,
													selected &&
														"bg-blue-500 text-white hover:bg-gray-800",
													disabled
														? "cursor-not-allowed text-gray-300"
														: !selected && "hover:bg-gray-100",
												)}
											>
												{day}
											</button>
										);
									})}
									{Array.from({ length: trailing }, (_, i) => {
										const next = new Date(year, monthIndex + 1, i + 1);
										return (
											<div
												key={ymd(next)}
												className={cn(CELL, "cursor-default text-gray-400")}
											>
												{next.getDate()}
											</div>
										);
									})}
								</div>
							</div>
						</Popover.Popup>
					</Popover.Positioner>
				</Popover.Portal>
			</Popover.Root>
		</div>
	);
}
