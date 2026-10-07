"use client";

import { Check } from "lucide-react";
import type { StepStatus, WizardStep } from "@/lib/role-assessment/wizard";
import { cn } from "@/lib/utils";

// antd Steps + staging-ийн `.top_menu_steps` / `.right_menu_steps` override (📦 CSS).
// Геометр antd v5-ийнх: label-vertical — content 112px, icon margin-inline-start 40px,
// tail margin-inline-start 56px, padding 0 24px.

export interface TopStepItem {
	number: WizardStep;
	label: string;
	status: StepStatus;
}

/** Дээд stepper ("АЛХАМ 1–4"), labelPlacement vertical. */
export function TopStepper({
	items,
	current,
}: {
	items: TopStepItem[];
	current: WizardStep;
}) {
	return (
		<ol className="flex w-full" aria-label="Алхмууд">
			{items.map((item, index) => {
				const last = index === items.length - 1;
				const active = item.number === current;
				const colored = item.status === "finish" || active;
				return (
					<li
						key={item.number}
						aria-current={active ? "step" : undefined}
						className={cn(
							"relative overflow-visible",
							last ? "flex-none" : "flex-1",
						)}
					>
						{!last && (
							<div
								aria-hidden
								className="absolute top-[14px] left-0 ms-14 w-full px-6"
							>
								<span
									className={cn(
										"block h-px w-full",
										colored ? "bg-[#8ca9ff]" : "bg-[rgba(5,5,5,0.06)]",
									)}
								/>
							</div>
						)}
						<div className="relative">
							<div
								className={cn(
									"ms-10 flex h-7 w-7 items-center justify-center rounded-[10px]",
									colored ? "bg-[#7094ff]" : "bg-[rgba(0,0,0,0.06)]",
								)}
							>
								{item.status === "finish" && !active ? (
									<Check
										className="size-3.5 text-white"
										strokeWidth={3}
										aria-hidden
									/>
								) : (
									<span
										className={cn(
											"font-medium text-[14px] leading-[140%]",
											colored ? "text-white" : "bg-[#f0f6fc] text-[#cbd5e1]",
										)}
									>
										{item.number}
									</span>
								)}
							</div>
							<div className="mt-[2px] block w-[112px] text-center">
								<div
									className={cn(
										"font-medium text-[10px] leading-[140%]",
										colored ? "text-[#8ca9ff]" : "text-[#cbd5e1]",
									)}
								>
									{item.label}
								</div>
							</div>
						</div>
					</li>
				);
			})}
		</ol>
	);
}

export interface RightStepItem {
	number: WizardStep;
	status: StepStatus;
	title: React.ReactNode;
	description?: React.ReactNode;
	/** Дарахад (stepNavigation) */
	onSelect: () => void;
	label: string;
}

/** Баруун самбарын босоо алхмууд. */
export function RightSteps({
	items,
	current,
}: {
	items: RightStepItem[];
	current: WizardStep;
}) {
	return (
		<ol className="flex flex-col" aria-label="Алхмууд">
			{items.map((item) => {
				const active = item.number === current;
				const colored = item.status === "finish" || active;
				return (
					<li
						key={item.number}
						aria-current={active ? "step" : undefined}
						className="relative flex flex-row"
					>
						<span
							className={cn(
								"me-2 mt-[14px] flex h-7 min-w-7 max-w-7 shrink-0 items-center justify-center rounded-[10px]",
								colored ? "bg-[#72bf0f]" : "bg-[rgba(0,0,0,0.06)]",
							)}
						>
							{item.status === "finish" && !active ? (
								<Check
									className="size-3.5 text-white"
									strokeWidth={3}
									aria-hidden
								/>
							) : (
								<span
									className={cn(
										"font-medium text-[14px] leading-[140%]",
										colored ? "text-white" : "bg-[#e4e8ef] text-[#92a3bb]",
									)}
								>
									{item.number}
								</span>
							)}
						</span>
						<div
							className={cn(
								"flex min-h-[60px] w-full flex-col justify-center p-3",
								active && "rounded-lg border border-[#72bf0f]",
							)}
						>
							{/* stretched button: ::after нь мөрийг бүхэлд нь хамарна, тайлбар доторх
							    "хасах" товчнууд z-10-оор дээр нь гарна (button дотор button үүсэхгүй) */}
							<button
								type="button"
								aria-label={item.label}
								onClick={item.onSelect}
								className="w-full cursor-pointer text-left font-medium text-[#10182b] text-[14px] leading-[140%] outline-none after:absolute after:inset-0 after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-Primary/40"
							>
								{item.title}
							</button>
							{item.description && (
								<div className="relative z-10">{item.description}</div>
							)}
						</div>
					</li>
				);
			})}
		</ol>
	);
}
