"use client";

import {
	ChevronSmallIcon,
	CircleCheckIcon,
	ClockIcon,
	CloseIcon,
	StepDoingIcon,
	StepDoneIcon,
} from "@/components/icons/role-assessment";
import type {
	StepView,
	WizardQuestion,
	WizardTest,
} from "@/lib/role-assessment/wizard";
import { cn } from "@/lib/utils";

// Staging баруун самбарын хэсгүүд (📦 `$`, `X`, `U`, `J`, `Y`, алхмын гарчиг).

export function RightStepTitle({
	title,
	count,
	current,
	badge,
}: {
	title: string;
	/** Алхам 2, 3: "R/max" */
	count?: string;
	current: boolean;
	badge: StepView["badge"];
}) {
	return (
		<span className="block w-full">
			<span className="flex items-center justify-between">
				<span className="block">
					<span className="flex items-center gap-1">
						<span>{title}</span>
						{count !== undefined && (
							<span
								className={cn(
									"rounded-full bg-Gray-200 px-2 py-0.5 text-[11px] text-TextColor-secondary leading-4",
									!current && "opacity-40",
								)}
							>
								{count}
							</span>
						)}
					</span>
					{badge === "done" ? (
						<span className="mt-[2px] flex items-center gap-1">
							<StepDoneIcon className="text-Semantic-success500" />
							<span className="block text-[10px] text-Semantic-success500 leading-[140%]">
								Болсон
							</span>
						</span>
					) : badge === "doing" ? (
						<span className="mt-[2px] flex items-center gap-[2px]">
							<StepDoingIcon className="text-TextColor-third" />
							<span className="block text-[10px] text-TextColor-third leading-[140%]">
								Хийж байна
							</span>
						</span>
					) : null}
				</span>
				<span
					aria-hidden
					className="flex items-center justify-center p-2.5 text-TextColor-main"
				>
					<ChevronSmallIcon className="size-4" />
				</span>
			</span>
		</span>
	);
}

const REMOVE_BTN =
	"absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-gray-200 text-TextColor-third transition-colors hover:bg-Gray-200 hover:text-TextColor-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40";

export function SelectedTestsList({
	tests,
	onRemove,
	readOnly,
}: {
	tests: WizardTest[];
	onRemove?: (id: string) => void;
	readOnly: boolean;
}) {
	return (
		<div className="mt-3 space-y-2">
			{tests.length === 0 ? (
				<p className="text-center text-[14px] text-TextColor-main leading-[140%]">
					Хоосон байна
				</p>
			) : (
				tests.map((t) => (
					<div
						key={t.id}
						className="relative rounded-[10px] border-[0.6px] border-Stroke-700 bg-Gray-50 p-3"
					>
						{!readOnly && onRemove && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onRemove(t.id);
								}}
								onKeyDown={(e) => e.stopPropagation()}
								className={REMOVE_BTN}
								aria-label={`"${t.title}" хасах`}
							>
								<CloseIcon className="text-TextColor-main" />
							</button>
						)}
						<div className="flex items-start gap-1">
							<CircleCheckIcon className="shrink-0 text-Primary-press" />
							<div className="min-w-0 flex-1 pr-6">
								<p className="text-[14px] text-TextColor-main leading-[140%]">
									{t.title}
								</p>
								<p className="mt-1 text-[12px] text-TextColor-third leading-[140%]">
									{t.questions} асуулт • {t.duration} мин
								</p>
							</div>
						</div>
					</div>
				))
			)}
		</div>
	);
}

export function SelectedQuestionsList({
	questions,
	onRemove,
	readOnly,
}: {
	questions: WizardQuestion[];
	onRemove?: (id: number) => void;
	readOnly: boolean;
}) {
	return (
		<div className="mt-2 space-y-4">
			{questions.length === 0 ? (
				<p className="text-center text-[14px] text-TextColor-main leading-[140%]">
					Хоосон байна
				</p>
			) : (
				questions.map((q) => (
					<div
						key={q.id}
						className="relative flex items-start gap-1.5 rounded-[10px] border border-Stroke-700 bg-Gray-50 p-3"
					>
						{!readOnly && onRemove && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onRemove(q.id);
								}}
								onKeyDown={(e) => e.stopPropagation()}
								className={REMOVE_BTN}
								aria-label="Асуулт хасах"
							>
								<CloseIcon className="text-TextColor-main" />
							</button>
						)}
						<CircleCheckIcon className="shrink-0 text-Primary-press" />
						<div className="w-full pr-6">
							<p className="mb-1.5 text-[14px] text-TextColor-main leading-[140%]">
								{q.text}
							</p>
							<div className="flex items-center justify-end gap-0.5">
								<ClockIcon className="text-TextColor-third" />
								<p className="text-[12px] text-TextColor-third leading-[140%]">
									{q.duration} мин
								</p>
							</div>
						</div>
					</div>
				))
			)}
		</div>
	);
}

function SummaryRow({
	label,
	value,
}: {
	label: string;
	value: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-between">
			<span className="text-[14px] text-TextColor-third leading-[140%]">
				{label}
			</span>
			<span className="font-medium text-[16px] text-TextColor-main leading-5">
				{value}
			</span>
		</div>
	);
}

/** Алхам 2 (`U`), 3 (`J`), 4 (`Y`)-ын нэгтгэл. */
export function StepSummary({
	step,
	testCount,
	totalQuestions,
	questionCount,
	duration,
}: {
	step: 2 | 3 | 4;
	testCount: number;
	totalQuestions: number;
	questionCount: number;
	/** Алхам 2-т асуултгүй, 3–4-т асуултын хугацаа нэмэгдсэн */
	duration: { min: number; max: number };
}) {
	return (
		<div
			className={cn(
				"space-y-3 border-Stroke-500 border-t px-3 py-2",
				step !== 2 && "rounded-lg",
				step === 4 && "mt-[10px]",
			)}
		>
			<SummaryRow label="Сонгосон тест:" value={testCount} />
			{step === 2 ? (
				<SummaryRow label="Нийт асуулт:" value={totalQuestions} />
			) : (
				<>
					<SummaryRow label="Нэмэлт асуулт:" value={questionCount} />
					<SummaryRow
						label="Нийт асуулт:"
						value={totalQuestions + questionCount}
					/>
				</>
			)}
			<SummaryRow
				label="Нийт хугацаа:"
				value={`${duration.min}-${duration.max} мин`}
			/>
		</div>
	);
}
