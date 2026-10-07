"use client";

import {
	RecruitmentStatusPill,
	SkeletonBlock,
} from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import {
	DrawerCard,
	DrawerDate,
	DrawerEmpty,
	DrawerField,
	DrawerSection,
	DrawerStrong,
	DrawerText,
	RaDrawer,
} from "@/components/role-assessment/ui/Drawer";
import { getErrorMessage } from "@/lib/api-errors";
import {
	detailProgressLabel,
	formatPersonShort,
	minutesLabel,
} from "@/lib/format";
import { useRecruitmentDetail } from "@/lib/hooks/role-assessment/queries";
import type {
	RecruitmentCustomQuestion,
	RecruitmentTest,
} from "@/lib/types/role-assessment";

// Staging "Дэлгэрэнгүй" drawer (📦 module 2387): GET /customer/recruitments/{id} зөвхөн
// нээгдсэн үед. Staging ачаалах/алдааны үед хоосон харагдана — бид skeleton ба
// алдааны мессеж харуулна (mismatches.md).

function TestList({ tests }: { tests: RecruitmentTest[] }) {
	if (tests.length === 0)
		return <DrawerEmpty description="Та тест сонгоогүй байна." />;
	return (
		<div className="flex flex-col gap-2">
			{tests.map((t, i) => (
				<div
					key={t.id}
					className="flex items-center gap-3 rounded-xl border border-Stroke-700 p-4"
				>
					<span className="shrink-0 self-center font-medium text-TextColor-main text-sm leading-[1.4] tracking-[0.2px]">
						{i + 1}.
					</span>
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-TextColor-main text-sm leading-[1.4] tracking-[0.2px]">
							{t.name}
						</p>
						<div className="mt-1 flex items-center gap-3 font-medium text-TextColor-third text-sm leading-[1.4] tracking-[0.2px]">
							<span>{t.questionCount} асуулт</span>
							<span>{minutesLabel(t)}</span>
						</div>
					</div>
					{t.category ? (
						<span className="shrink-0 rounded-lg bg-Gray-50 px-3 py-1.5 font-medium text-TextColor-secondary text-sm leading-[1.4] tracking-[0.2px]">
							{t.category}
						</span>
					) : null}
				</div>
			))}
		</div>
	);
}

function QuestionList({
	questions,
}: {
	questions: RecruitmentCustomQuestion[];
}) {
	if (questions.length === 0) {
		return <DrawerEmpty description="Та нэмэлт асуулт сонгоогүй байна." />;
	}
	return (
		<div className="flex flex-col gap-2">
			{questions.map((q, i) => (
				<div
					key={q.id}
					className="flex gap-3 rounded-xl border border-Stroke-700 p-4"
				>
					<span className="shrink-0 font-medium text-TextColor-main text-sm leading-[1.4] tracking-[0.2px]">
						{i + 1}.
					</span>
					<div className="min-w-0 flex-1">
						<p className="font-semibold text-TextColor-main text-sm leading-[1.4] tracking-[0.2px]">
							{q.content}
						</p>
						{q.description ? (
							<p className="mt-1 font-medium text-TextColor-third text-sm leading-[1.4] tracking-[0.2px]">
								{q.description}
							</p>
						) : null}
					</div>
				</div>
			))}
		</div>
	);
}

export function RecruitmentDetailDrawer({
	recruitment,
	onClose,
}: {
	/** Нээгдсэн мөр (нэр нь ачаалж байх үед гарчиг болно) */
	recruitment: { id: string; name: string } | null;
	onClose: () => void;
}) {
	const open = recruitment !== null;
	const query = useRecruitmentDetail(open ? recruitment.id : undefined);
	const detail = query.data;
	return (
		<RaDrawer
			open={open}
			onClose={onClose}
			title={detail?.name ?? recruitment?.name ?? ""}
		>
			{query.isPending && open ? (
				<div className="flex flex-col gap-4" aria-busy="true">
					<SkeletonBlock className="h-40 w-full rounded-2xl" />
					<SkeletonBlock className="h-24 w-full rounded-2xl" />
					<SkeletonBlock className="h-24 w-full rounded-2xl" />
				</div>
			) : query.isError ? (
				<div
					role="alert"
					className="flex flex-col items-center gap-3 py-10 text-center"
				>
					<p className="font-semibold text-TextColor-main text-base">
						{getErrorMessage(query.error, "Мэдээлэл авахад алдаа гарлаа")}
					</p>
					<RaButton
						variant="outline"
						size="small"
						title="Дахин оролдох"
						onClick={() => query.refetch()}
					/>
				</div>
			) : detail ? (
				<>
					<DrawerSection label="Үндсэн мэдээлэл">
						<div className="flex flex-col gap-2">
							<DrawerCard>
								<DrawerField label="Төлөв">
									<RecruitmentStatusPill status={detail.status} />
								</DrawerField>
								<DrawerField label="Явц">
									<DrawerStrong value={detailProgressLabel(detail)} />
								</DrawerField>
							</DrawerCard>
							<DrawerCard>
								<DrawerField label="Үүсгэсэн">
									<DrawerText value={formatPersonShort(detail.createdBy)} />
								</DrawerField>
								<DrawerField label="Үүсгэсэн">
									<DrawerDate value={detail.createdAt} />
								</DrawerField>
							</DrawerCard>
							<DrawerCard>
								<DrawerField label="Нийтлэсэн">
									<DrawerText value={formatPersonShort(detail.publishedBy)} />
								</DrawerField>
								<DrawerField label="Нийтлэсэн">
									<DrawerDate value={detail.publishedAt} />
								</DrawerField>
							</DrawerCard>
							{detail.status === "CLOSED" ? (
								<DrawerCard>
									<DrawerField label="Хаасан">
										<DrawerText value={formatPersonShort(detail.closedBy)} />
									</DrawerField>
									<DrawerField label="Хаасан">
										<DrawerDate value={detail.closedAt} />
									</DrawerField>
								</DrawerCard>
							) : null}
						</div>
					</DrawerSection>
					<DrawerSection label="Сонгосон тестүүд">
						<TestList tests={detail.tests ?? []} />
					</DrawerSection>
					<DrawerSection label="Нэмэлт асуулт">
						<QuestionList questions={detail.customQuestions ?? []} />
					</DrawerSection>
				</>
			) : null}
		</RaDrawer>
	);
}
