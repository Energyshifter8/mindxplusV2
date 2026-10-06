"use client";

import { useRouter } from "next/navigation";
import {
	PlusIcon,
	StatCompletedIcon,
	StatInvitationBalanceIcon,
	StatInvitedIcon,
	StatRespondentsIcon,
	StatSurveyBalanceIcon,
	StatSurveyPublishedIcon,
} from "@/components/icons/staging";
import {
	RecruitmentStatusPill,
	SurveyStatusBadge,
} from "@/components/shared/StagingStatusBadge";
import { openContactSupport } from "@/components/shell/ContactSupport";
import { AntdSkeleton } from "@/components/ui/antd-skeleton";
import { StagingButton } from "@/components/ui/staging-button";
import { useAccountInfo, useProfile } from "@/lib/hooks/useAccountQueries";
import { useIsClient } from "@/lib/hooks/useClient";
import {
	toRows,
	useHomeHiringStats,
	useHomeLatestTalents,
	useHomeRecruitments,
	useHomeSurveyStats,
	useHomeSurveys,
} from "@/lib/hooks/useHomeQueries";
import { ROUTES, routeTo } from "@/lib/routes";
import type {
	InvitationProjection,
	MySurveyView,
	RecruitmentListView,
} from "@/lib/types/api";

// Staging /home (📦 bundle module 83718 + DOM хэмжилт, docs/parity/home.md §4).

/** Staging `l()`: огноо нь UTC (toISOString), цаг нь локал (toTimeString) — ижил байдлаар. */
function splitDateTime(value?: string | null): { date: string; time: string } {
	if (!value) return { date: "-", time: "" };
	try {
		const d = new Date(value);
		return {
			date: d.toISOString().slice(0, 10),
			time: d.toTimeString().slice(0, 5),
		};
	} catch {
		return { date: String(value), time: "" };
	}
}

/** Staging: <60мин "N минутын өмнө", <24ц "N цагийн өмнө", 1 өдөр "Өдрийн өмнө", бусад "N өдрийн өмнө". */
function relativeTime(value?: string | null): string {
	if (!value) return "-";
	try {
		const minutes = Math.floor(
			(Date.now() - new Date(value).getTime()) / 60_000,
		);
		if (minutes < 60) return `${minutes} минутын өмнө`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours} цагийн өмнө`;
		const days = Math.floor(hours / 24);
		return days === 1 ? "Өдрийн өмнө" : `${days} өдрийн өмнө`;
	} catch {
		return "-";
	}
}

function DateTimeCell({ value }: { value?: string | null }) {
	const { date, time } = splitDateTime(value);
	if (!time) {
		return (
			<span className="font-medium text-TextColor-secondary text-[14px]">
				{date}
			</span>
		);
	}
	return (
		<div className="flex items-center gap-2 whitespace-nowrap text-[14px] tracking-[0.2px]">
			<span className="font-medium text-TextColor-secondary">{date}</span>
			<span className="font-semibold text-TextColor-third">•</span>
			<span className="font-medium text-TextColor-secondary">{time}</span>
		</div>
	);
}

/** Staging stat card (module 94621): ≥ 10000 → "Хязгааргүй", null → 0 */
function StatCard({
	icon,
	count,
	label,
}: {
	icon: React.ReactNode;
	count?: number | null;
	label: string;
}) {
	return (
		<div className="flex h-full min-w-0 flex-1 flex-col gap-[10px] rounded-2xl border border-[#e4e8ef] p-4">
			<div className="flex h-[14.4px] w-[14.4px] items-center justify-center">
				{icon}
			</div>
			<div className="flex flex-col gap-1">
				<p className="font-bold text-[20px] text-TextColor-main leading-6">
					{typeof count === "number" && count >= 10_000
						? "Хязгааргүй"
						: (count ?? 0)}
				</p>
				<p className="font-medium text-[14px] text-TextColor-third leading-[1.4] tracking-[0.2px]">
					{label}
				</p>
			</div>
		</div>
	);
}

// --- shadcn table (staging module 22079) + staging-ийн класс ---

const TABLE_BOX = "overflow-hidden rounded-2xl border border-[#e4e8ef]";
const TH = "h-10 px-2 text-left align-middle font-semibold text-[#64748b]";
const TD = "p-2 align-middle";
const ROW_BASE = "border-b border-[#e4e8ef] transition-colors";
const BODY_ROW = `${ROW_BASE} h-14 text-[14px]`;
const EMPTY_TEXT =
	"text-center font-medium text-[14px] text-TextColor-secondary";

function TableShell({
	headClassName,
	head,
	children,
}: {
	headClassName: string;
	head: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="relative w-full overflow-auto">
			<table className="w-full caption-bottom text-sm [&_td]:!px-4 [&_th]:!px-4">
				<thead className="[&_tr]:border-b">
					<tr className={`${ROW_BASE} hover:bg-[#f1f5f9]/50 ${headClassName}`}>
						{head}
					</tr>
				</thead>
				<tbody className="[&_tr:last-child]:border-0">{children}</tbody>
			</table>
		</div>
	);
}

function SurveyTable({
	surveys,
	isFetching,
}: {
	surveys: MySurveyView[];
	isFetching: boolean;
}) {
	const router = useRouter();
	return (
		<div className={TABLE_BOX}>
			{isFetching ? (
				<div className="px-4 py-6">
					<AntdSkeleton rows={4} />
				</div>
			) : (
				<TableShell
					headClassName="h-10 bg-Gray-50 font-semibold text-[12px] text-TextColor-main tracking-[0.2px]"
					head={
						<>
							<th className={`${TH} w-8`}>№</th>
							<th className={`${TH} min-w-0`}>Нэр</th>
							<th className={`${TH} w-[130px]`}>Төлөв</th>
							<th className={`${TH} w-16 text-center`}>Асуулт</th>
							<th className={`${TH} w-16 text-center`}>Явц</th>
							<th className={`${TH} w-[160px]`}>Үүсгэсэн</th>
						</>
					}
				>
					{surveys.length > 0 ? (
						surveys.map((survey, index) => {
							const received = survey.receivedResponseCount ?? 0;
							const goal = survey.goal ?? 0;
							const suspended = survey.status === "SUSPENDED";
							return (
								<tr
									key={survey.id}
									onClick={() => {
										if (suspended || !survey.id) return;
										router.push(
											survey.status === "CREATED"
												? routeTo.surveyEdit(survey.id)
												: routeTo.surveyInsight(survey.id),
										);
									}}
									className={`${BODY_ROW} ${suspended ? "" : "cursor-pointer hover:bg-Primary-softBg"}`}
								>
									<td className={`${TD} font-medium text-TextColor-main`}>
										{index + 1}.
									</td>
									<td
										className={`${TD} min-w-0 max-w-0 truncate font-semibold text-TextColor-main leading-[1.4] tracking-[0.2px]`}
									>
										{survey.name}
									</td>
									<td className={TD}>
										<SurveyStatusBadge status={survey.status} />
									</td>
									<td
										className={`${TD} text-center font-medium text-TextColor-main tracking-[0.2px]`}
									>
										{survey.questionCount ?? "-"}
									</td>
									<td
										className={`${TD} text-center font-medium text-TextColor-main tracking-[0.2px]`}
									>
										{goal > 0 ? `${received}/${goal}` : "-"}
									</td>
									<td className={TD}>
										<DateTimeCell
											value={survey.publishedAt ?? survey.createdAt}
										/>
									</td>
								</tr>
							);
						})
					) : (
						<tr className={ROW_BASE}>
							<td colSpan={6} className={`${TD} py-8 ${EMPTY_TEXT}`}>
								Шинжилгээ байхгүй байна
							</td>
						</tr>
					)}
				</TableShell>
			)}
		</div>
	);
}

function RecruitmentTable({
	recruitments,
	isFetching,
}: {
	recruitments: RecruitmentListView[];
	isFetching: boolean;
}) {
	const router = useRouter();
	return (
		<div className={TABLE_BOX}>
			{isFetching ? (
				<div className="px-4 py-4">
					<AntdSkeleton rows={3} />
				</div>
			) : (
				<TableShell
					headClassName="h-10 bg-Gray-50 font-semibold text-[12px] text-TextColor-main tracking-[0.2px]"
					head={
						<>
							<th className={`${TH} w-8`}>№</th>
							<th className={`${TH} min-w-0`}>Нэр</th>
							<th className={`${TH} w-[130px]`}>Төлөв</th>
							<th className={`${TH} w-16 text-center`}>Талент</th>
							<th className={`${TH} w-[160px]`}>Үүсгэсэн</th>
						</>
					}
				>
					{recruitments.length > 0 ? (
						recruitments.map((item, index) => (
							<tr
								key={item.id}
								onClick={() => {
									if (!item.id) return;
									router.push(
										item.status === "CREATED"
											? routeTo.roleAssessmentWizard(item.id)
											: routeTo.roleAssessmentDashboard(item.id),
									);
								}}
								className={`${BODY_ROW} cursor-pointer hover:bg-Primary-softBg`}
							>
								<td className={`${TD} font-medium text-TextColor-main`}>
									{index + 1}.
								</td>
								<td
									className={`${TD} min-w-0 max-w-0 truncate font-semibold text-TextColor-main leading-[1.4] tracking-[0.2px]`}
								>
									{item.name}
								</td>
								<td className={TD}>
									<div className="flex">
										<RecruitmentStatusPill status={item.status ?? ""} />
									</div>
								</td>
								<td
									className={`${TD} text-center font-medium text-TextColor-main tracking-[0.2px]`}
								>
									{item.totalInvitationCount && item.totalInvitationCount > 0
										? item.totalInvitationCount
										: "-"}
								</td>
								<td className={TD}>
									<DateTimeCell value={item.createdAt ?? item.publishedAt} />
								</td>
							</tr>
						))
					) : (
						<tr className={ROW_BASE}>
							<td colSpan={5} className={`${TD} py-6 ${EMPTY_TEXT}`}>
								Талентийн үнэлгээ байхгүй байна
							</td>
						</tr>
					)}
				</TableShell>
			)}
		</div>
	);
}

function LatestTalentsTable({
	talents,
	isFetching,
}: {
	talents: InvitationProjection[];
	isFetching: boolean;
}) {
	const router = useRouter();
	return (
		<div className={TABLE_BOX}>
			{isFetching ? (
				<div className="px-4 py-4">
					<AntdSkeleton rows={3} />
				</div>
			) : (
				<TableShell
					headClassName="h-10 bg-Ghost-50 font-semibold text-[12px] text-TextColor-main tracking-[0.2px]"
					head={
						<>
							<th className={`${TH} w-4`}>№</th>
							<th className={TH}>Нэр</th>
							<th className={`${TH} min-w-0`}>Ажлын байр</th>
							<th className={`${TH} w-[160px]`}>Бөглөсөн хугацаа</th>
						</>
					}
				>
					{talents.length > 0 ? (
						talents.map((talent, index) => {
							const name =
								[talent.lastName, talent.firstName].filter(Boolean).join(" ") ||
								talent.email ||
								"-";
							return (
								<tr
									key={talent.id ?? index}
									onClick={() => {
										if (talent.recruitmentId && talent.id) {
											router.push(
												routeTo.roleAssessmentResult(
													talent.recruitmentId,
													talent.id,
												),
											);
										}
									}}
									className={`${BODY_ROW} cursor-pointer hover:bg-Primary-softBg`}
								>
									<td className={`${TD} font-medium text-TextColor-main`}>
										{index + 1}.
									</td>
									<td
										className={`${TD} truncate font-semibold text-TextColor-main leading-[1.4] tracking-[0.2px]`}
									>
										{name}
									</td>
									<td
										className={`${TD} min-w-0 max-w-[220px] truncate font-medium text-TextColor-main leading-[1.4] tracking-[0.2px]`}
									>
										{talent.recruitmentName || "-"}
									</td>
									<td
										className={`${TD} truncate font-medium text-TextColor-secondary tracking-[0.2px]`}
									>
										{relativeTime(talent.completedAt)}
									</td>
								</tr>
							);
						})
					) : (
						<tr className={ROW_BASE}>
							<td colSpan={4} className={`${TD} py-6 ${EMPTY_TEXT}`}>
								Дууссан үнэлгээ байхгүй байна
							</td>
						</tr>
					)}
				</TableShell>
			)}
		</div>
	);
}

function PanelHeader({
	title,
	description,
	action,
	centered,
}: {
	title: string;
	description: string;
	action: React.ReactNode;
	centered: boolean;
}) {
	return (
		<div
			className={`flex justify-between gap-2 ${centered ? "items-center" : ""}`}
		>
			<div>
				<p className="whitespace-nowrap font-bold text-[14px] text-TextColor-main leading-5">
					{title}
				</p>
				<p className="font-normal text-[12px] text-TextColor-secondary leading-4">
					{description}
				</p>
			</div>
			{action}
		</div>
	);
}

/** Staging `y()` / `T()` — accountInfo-оос хамаарах banner-ууд (зөвхөн client: localStorage). */
function AccountBanners() {
	const router = useRouter();
	const account = useAccountInfo();
	const { data: profile, isPending } = useProfile();
	const role = profile?.role ?? "OWNER";
	const bannerClass =
		"flex min-h-[70px] w-full items-center justify-between gap-6 bg-Semantic-warning100 py-[15px] pr-[22px] pl-[29px] font-sf";
	return (
		<>
			{account?.expired && (
				<div className={bannerClass}>
					<div className="min-w-0 text-[16px] leading-5 tracking-[0.2px]">
						<p className="font-semibold text-TextColor-main">
							Таны багцын хүчинтэй хугацаа дууссан байна.
						</p>
						<p className="font-medium text-TextColor-secondary">
							Багцын хүчинтэй хугацаа дуусахад бүтээгдэхүүнийг ашиглах боломжгүй
							болно. Та бидэнтэй холбогдон багцаа сунгуулна уу.
						</p>
					</div>
					<StagingButton
						variant="outline"
						size="small"
						title="Холбоо барих"
						onClick={openContactSupport}
						className="shrink-0"
					/>
				</div>
			)}
			{account?.planType === "FREE" && !isPending && role === "OWNER" && (
				<div className={bannerClass}>
					<div className="min-w-0 text-[16px] leading-5 tracking-[0.2px]">
						<p className="font-semibold text-TextColor-main">
							Илүү олон боломжийг нээгээрэй
						</p>
						<p className="font-medium text-TextColor-secondary">
							Төлбөртэй багцад шилжиж, mindXplus-ийн илүү олон боломжийг
							ашиглаарай.
						</p>
					</div>
					<StagingButton
						variant="outline"
						size="small"
						title="Багц сонгох"
						onClick={() => router.push(`${ROUTES.profile}?section=membership`)}
						className="shrink-0"
					/>
				</div>
			)}
		</>
	);
}

export function HomePage() {
	const router = useRouter();
	const isClient = useIsClient();
	// Staging-д "profile" query хамгийн түрүүнд эхэлдэг (layout-ын UserProvider/useRole)
	useProfile();
	const surveys = useHomeSurveys();
	const surveyStats = useHomeSurveyStats();
	const recruitments = useHomeRecruitments();
	const hiringStats = useHomeHiringStats();
	const latestTalents = useHomeLatestTalents();

	return (
		<div className="min-h-full bg-white font-sf">
			<header className="flex h-[72px] items-center border-Stroke-600 border-b bg-white px-6">
				<p className="font-bold text-2xl text-TextColor-main leading-[1.4]">
					Нүүр хуудас
				</p>
			</header>
			{isClient && <AccountBanners />}
			<div className="grid grid-cols-1 gap-6 px-6 pt-6 pb-8 xl:grid-cols-2">
				<div className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-[#e4e8ef] bg-white p-6">
					<PanelHeader
						centered
						title="Миний шинжилгээ"
						description="Таны үндсэн үнэлгээний үйл ажиллагааг товч харуулав."
						action={
							<StagingButton
								variant="primary"
								size="small"
								title="Шинжилгээ үүсгэх"
								prefixIcon={<PlusIcon />}
								onClick={() => router.push(ROUTES.templates)}
								className="whitespace-nowrap"
							/>
						}
					/>
					<div className="flex max-h-[150px] min-h-[124px] gap-4">
						{surveyStats.isFetching ? (
							<AntdSkeleton rows={2} />
						) : (
							<>
								<StatCard
									icon={<StatSurveyPublishedIcon />}
									count={surveyStats.data?.totalPublishedSurveyCount}
									label="Нийтэлсэн шинжилгээний тоо"
								/>
								<StatCard
									icon={<StatRespondentsIcon />}
									count={surveyStats.data?.totalRespondentCount}
									label="Нийт шинжилгээнд оролцогчдын тоо"
								/>
								<StatCard
									icon={<StatSurveyBalanceIcon />}
									count={surveyStats.data?.surveyBalance}
									label="Үлдсэн шинжилгээний эрх"
								/>
							</>
						)}
					</div>
					<SurveyTable
						surveys={toRows<MySurveyView>(surveys.data)}
						isFetching={surveys.isFetching}
					/>
				</div>

				<div className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-[#e4e8ef] bg-white p-6">
					<PanelHeader
						centered={false}
						title="Талентийн үнэлгээ"
						description="Үүссэн талентийн үнэлгээ болон оролцогчдын бөглөсөн үр дүнг шууд харах."
						action={
							<StagingButton
								variant="primary"
								size="small"
								title="Талентийн үнэлгээ үүсгэх"
								prefixIcon={<PlusIcon />}
								onClick={() => router.push(ROUTES.roleAssessment)}
								className="whitespace-nowrap"
							/>
						}
					/>
					<div className="flex max-h-[150px] min-h-[124px] gap-4">
						{hiringStats.isFetching ? (
							<AntdSkeleton rows={2} />
						) : (
							<>
								<StatCard
									icon={<StatInvitedIcon />}
									count={hiringStats.data?.totalInvitationCount}
									label="Нийт урьсан талент"
								/>
								<StatCard
									icon={<StatCompletedIcon />}
									count={hiringStats.data?.totalCompletedCount}
									label="Нийт үнэлгээнд оролцсон талент"
								/>
								<StatCard
									icon={<StatInvitationBalanceIcon />}
									count={hiringStats.data?.invitationBalance}
									label="Үлдсэн урилгын эрх"
								/>
							</>
						)}
					</div>
					<RecruitmentTable
						recruitments={toRows<RecruitmentListView>(recruitments.data)}
						isFetching={recruitments.isFetching}
					/>
					<LatestTalentsTable
						talents={toRows<InvitationProjection>(latestTalents.data)}
						isFetching={latestTalents.isFetching}
					/>
				</div>
			</div>
		</div>
	);
}
