"use client";

import {
	CheckboxCheckedIcon,
	CheckboxIcon,
	ClockIcon,
} from "@/components/icons/role-assessment";
import type {
	CategoryOption,
	WizardQuestion,
} from "@/lib/role-assessment/wizard";
import { cn } from "@/lib/utils";
import { CategoryButtons } from "./StepTests";

// Staging алхам 3 (📦 `H`): зөвхөн каталогоос сонгоно (customer-question-controller RA-д
// ашиглагддаггүй — survey-д л).

export function StepQuestions({
	categories,
	selectedCategory,
	onCategory,
	questions,
	selectedIds,
	onToggle,
	loading,
	error,
	readOnly,
}: {
	categories: CategoryOption[];
	selectedCategory: string;
	onCategory: (key: string) => void;
	questions: WizardQuestion[];
	selectedIds: number[];
	onToggle: (id: number) => void;
	loading: boolean;
	error: React.ReactNode;
	readOnly: boolean;
}) {
	return (
		<>
			<div>
				<h2 className="font-medium text-TextColor-main text-base leading-[140%]">
					Нэмэлт асуулт нэмэх
				</h2>
				<p className="text-TextColor-third text-base leading-[140%]">
					Талентүүдийн туршлага, хандлага, ажиллах арга барилыг илүү сайн ойлгох
					зорилгоор нэмэлт асуултуудыг сонгоно уу.
				</p>
			</div>
			<fieldset className="flex flex-wrap items-center gap-[10px] border-Stroke-700 border-b py-4">
				<legend className="sr-only">Асуултын ангилал</legend>
				<CategoryButtons
					categories={categories}
					selected={selectedCategory}
					onSelect={onCategory}
					disabled={readOnly}
					label="Ангилал"
				/>
			</fieldset>
			<div className="mt-5 space-y-5 py-5">
				{loading ? (
					<div className="flex items-center justify-center py-10">
						<p className="text-[16px] text-TextColor-third">
							Асуултууд ачааллаж байна...
						</p>
					</div>
				) : error ? (
					error
				) : questions.length === 0 ? (
					<div className="flex items-center justify-center py-10">
						<p className="text-[16px] text-TextColor-third">Асуулт олдсонгүй</p>
					</div>
				) : (
					questions.map((q) => {
						const selected = selectedIds.includes(q.id);
						const order = selectedIds.indexOf(q.id) + 1;
						return (
							<label
								key={q.id}
								className={cn(
									"relative flex gap-3 rounded-[10px] border-[2px] p-[18px] transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-Primary/40",
									!readOnly && "cursor-pointer",
									selected
										? "border-Primary-hover bg-Primary-softBg"
										: "border-Gray-50 bg-Gray-50",
								)}
							>
								<input
									type="checkbox"
									className="sr-only"
									checked={selected}
									disabled={readOnly}
									onChange={() => onToggle(q.id)}
								/>
								{selected && (
									<span className="absolute -top-3 -right-3 z-40 flex h-7 w-7 items-center justify-center rounded-full bg-Gray-800 font-medium text-[16px] text-white leading-5">
										<span className="sr-only">Сонголтын дараалал: </span>
										{order}
									</span>
								)}
								<span className="mt-1 flex-shrink-0">
									{selected ? <CheckboxCheckedIcon /> : <CheckboxIcon />}
								</span>
								<span className="min-w-0 flex-1">
									<span className="block text-[16px] text-TextColor-main leading-[140%]">
										{q.text}
									</span>
									{q.description && (
										<span className="mt-1 block text-[14px] text-TextColor-secondary leading-[140%]">
											{q.description}
										</span>
									)}
								</span>
								<span className="flex flex-shrink-0 items-center gap-0.5 text-[14px] text-TextColor-third leading-[140%]">
									<ClockIcon className="text-TextColor-third" />
									<span>{q.duration} мин</span>
								</span>
							</label>
						);
					})
				)}
			</div>
		</>
	);
}
