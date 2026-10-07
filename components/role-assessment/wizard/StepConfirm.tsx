"use client";

import {
	ChatQuestionIcon,
	ClipboardIcon,
	ClockIcon,
	QuestionCircleIcon,
	TimerIcon,
} from "@/components/icons/role-assessment";
import type { WizardQuestion, WizardTest } from "@/lib/role-assessment/wizard";

// Staging алхам 4 (📦 `G`). "Худалдааны зөвлөх" нь staging-ийн нэргүй үеийн fallback.

export function StepConfirm({
	jobTitle,
	tests,
	questions,
	totalDuration,
}: {
	jobTitle: string;
	tests: WizardTest[];
	questions: WizardQuestion[];
	/** Асуултын хугацаа нэмэгдсэн нийт хугацаа */
	totalDuration: { min: number; max: number };
}) {
	const stats = [
		{
			icon: <ClipboardIcon className="text-Primary" />,
			value: tests.length,
			label: "Сонгосон тестийн тоо",
		},
		{
			icon: <ChatQuestionIcon className="text-Primary" />,
			value: questions.length,
			label: "Нэмэлт асуултын тоо",
		},
		{
			icon: <TimerIcon className="text-Primary" />,
			value: `${totalDuration.min}-${totalDuration.max} мин`,
			label: "Нийт зарцуулах хугацаа",
		},
	];
	return (
		<>
			<h1 className="font-medium text-[24px] text-TextColor-main leading-[140%]">
				{jobTitle || "Худалдааны зөвлөх"}
			</h1>
			<div className="mt-6 rounded-[20px] bg-Primary-softBg p-5">
				<div>
					<h3 className="font-semibold text-[16px] text-TextColor-main leading-5">
						Нэгтгэсэн мэдээлэл
					</h3>
					<div className="mt-3 grid grid-cols-1 gap-4 rounded-lg bg-white px-4 py-5 sm:grid-cols-3">
						{stats.map((s) => (
							<div key={s.label} className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-Primary-softBg">
									{s.icon}
								</div>
								<div>
									<p className="font-semibold text-[24px] text-TextColor-main leading-[140%]">
										{s.value}
									</p>
									<p className="mt-0.5 font-medium text-[14px] text-TextColor-third leading-[140%]">
										{s.label}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
				{tests.length > 0 && (
					<div className="mt-5">
						<h3 className="font-semibold text-[16px] text-TextColor-main leading-5">
							Сонгонсон тестүүд
						</h3>
						<div className="mt-3 space-y-2">
							{tests.map((t, i) => (
								<div
									key={t.id}
									className="flex rounded-lg border border-Stroke-500 bg-white p-3"
								>
									<span className="!h-6 !min-w-6 flex items-center justify-center rounded-full bg-Primary-softBg font-medium text-[14px] text-TextColor-secondary">
										{i + 1}
									</span>
									<div>
										<p className="ml-5 font-medium text-[16px] text-TextColor-main leading-5">
											{t.title}
										</p>
										<p className="mt-1 ml-5 text-[14px] text-TextColor-third leading-[140%]">
											{t.description}
										</p>
										<div className="mt-2 flex items-center gap-1 text-[14px] text-TextColor-secondary leading-[140%]">
											<div className="flex items-center gap-1 border-Stroke-600 border-r pr-5">
												<QuestionCircleIcon className="text-TextColor-secondary" />
												<span>{t.questions}</span>
											</div>
											<div className="flex items-center gap-1">
												<ClockIcon className="text-TextColor-secondary" />
												<span>{t.duration} Мин</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
				{questions.length > 0 && (
					<div className="mt-5">
						<h3 className="font-semibold text-[16px] text-TextColor-main leading-5">
							Сонгосон нэмэлт асуултууд
						</h3>
						<div className="mt-3 space-y-3">
							{questions.map((q, i) => (
								<div
									key={q.id}
									className="rounded-lg border border-Stroke-500 bg-white p-3"
								>
									<div className="flex w-full items-center justify-between gap-7">
										<div className="flex flex-1 items-start">
											<span className="!h-6 !min-w-6 flex items-center justify-center rounded-full bg-Primary-softBg font-medium text-[14px] text-TextColor-secondary">
												{i + 1}
											</span>
											<p className="ml-5 font-medium text-[16px] text-TextColor-main leading-5">
												{q.text}
											</p>
										</div>
										<div className="flex flex-shrink-0 items-center rounded-full bg-Primary-softBg px-2 py-0.5 text-[14px] text-TextColor-third leading-[140%]">
											<span>{q.duration} мин</span>
										</div>
									</div>
									<p className="mt-1 ml-12 text-[14px] text-TextColor-third leading-[140%]">
										{q.description}
									</p>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</>
	);
}
