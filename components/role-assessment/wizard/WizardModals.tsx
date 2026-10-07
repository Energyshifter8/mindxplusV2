"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import {
	CloseIcon,
	SparkleIcon,
	SparkleLargeIcon,
} from "@/components/icons/role-assessment";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaModal, RaModalTitle } from "@/components/role-assessment/ui/Modal";
import { RECOMMEND_QUESTIONS } from "@/lib/constants/roleAssessment";

// Staging "Тест санал болгох" modal (📦 `O`, antd Radio) ба нийтлэсний дараах modal.

export function RecommendModal({
	open,
	onClose,
	answers,
	onAnswer,
	onRecommend,
	loading,
}: {
	open: boolean;
	onClose: () => void;
	answers: string[];
	onAnswer: (index: number, value: string) => void;
	onRecommend: () => void;
	loading: boolean;
}) {
	const complete =
		answers.length === RECOMMEND_QUESTIONS.length && answers.every((a) => a);
	return (
		<RaModal
			open={open}
			onClose={onClose}
			width={600}
			className="gap-y-0 rounded-[16px] p-0"
			dismissible={!loading}
			header={
				<div className="flex items-center justify-between border-Stroke-500 border-b p-6">
					<div className="flex items-center gap-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-Primary-press">
							<SparkleIcon className="text-white" />
						</div>
						<div>
							<RaModalTitle className="text-[16px] text-TextColor-main leading-[24px]">
								Тест санал болгох
							</RaModalTitle>
							<p className="text-[14px] text-TextColor-secondary leading-5">
								{RECOMMEND_QUESTIONS.length} асуултад хариулна уу
							</p>
						</div>
					</div>
					<RaButton
						variant="ghost"
						prefixIcon={<CloseIcon className="!size-7 text-TextColor-main" />}
						onClick={onClose}
						ariaLabel="Хаах"
					/>
				</div>
			}
			bare
			footer={
				<div className="flex items-center justify-end gap-3 rounded-b-[16px] border-Stroke-700 border-t bg-Gray-50 p-6">
					<RaButton variant="outline" title="Буцах" onClick={onClose} />
					<RaButton
						variant="primary"
						title="Санал болгох"
						onClick={onRecommend}
						disabled={loading || !complete}
						prefixIcon={<SparkleLargeIcon className="text-white" />}
					/>
				</div>
			}
		>
			<div className="space-y-6 p-6">
				{RECOMMEND_QUESTIONS.map((q, index) => (
					<div key={q.id}>
						<p
							id={`ra-rec-${q.id}`}
							className="font-medium text-[14px] text-TextColor-main leading-[140%]"
						>
							{index + 1}.{index === 1 ? "" : " "}
							{q.title}
							<span className="text-Semantic-error500">*</span>
						</p>
						<RadioGroup
							aria-labelledby={`ra-rec-${q.id}`}
							value={answers[index] ?? ""}
							onValueChange={(value) => onAnswer(index, String(value))}
							className="mt-[22px] flex flex-col gap-4"
						>
							{q.options.map((o) => (
								// biome-ignore lint/a11y/noLabelWithoutControl: base-ui Radio.Root нь label доторх control
								<label
									key={o.value}
									className="flex cursor-pointer items-center gap-2 rounded-2xl border border-Stroke-700 px-3 py-2.5 font-medium text-[14px] leading-[140%]"
								>
									<Radio.Root
										value={o.value}
										className="flex size-4 shrink-0 items-center justify-center rounded-full border border-[#d9d9d9] bg-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#1677ff]/40 data-[checked]:border-[#1677ff] data-[checked]:bg-[#1677ff]"
									>
										<Radio.Indicator className="size-1.5 rounded-full bg-white" />
									</Radio.Root>
									{o.label}
								</label>
							))}
						</RadioGroup>
					</div>
				))}
			</div>
		</RaModal>
	);
}

export function PublishedModal({
	open,
	onGo,
}: {
	open: boolean;
	onGo: () => void;
}) {
	return (
		<RaModal
			open={open}
			onClose={onGo}
			width={600}
			className="p-10"
			header={
				<div className="flex items-center gap-3">
					<svg
						aria-hidden="true"
						width="32"
						height="32"
						viewBox="0 0 32 32"
						fill="none"
					>
						<circle cx="16" cy="16" r="16" fill="#72BF0F" />
						<path
							d="M9.3125 15.9146L12.9556 19.9625C13.3235 20.3713 13.9591 20.388 14.348 19.9991L22.9125 11.4346"
							stroke="white"
							strokeWidth="2.24"
							strokeLinecap="round"
						/>
					</svg>
					<RaModalTitle className="font-semibold text-[20px] text-TextColor-main leading-6">
						Хүсэлт амжилттай илгээгдлээ.
					</RaModalTitle>
				</div>
			}
			footer={
				<RaButton
					variant="outline"
					title="Талентийн үнэлгээ рүү очих"
					onClick={onGo}
					className="w-full"
				/>
			}
		>
			<p className="text-[16px] text-TextColor-secondary leading-[140%]">
				Таны талентийн үнэлгээ амжилттай үүслээ. Одоо талентүүдэд урилга илгээж,
				явцыг хянах боломжтой.
			</p>
		</RaModal>
	);
}
