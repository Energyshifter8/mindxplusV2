"use client";

import { type ReactNode, useState } from "react";
import {
	BadgeCheckIcon,
	ChevronSmallIcon,
	CloseIcon,
	EventCopyIcon,
	EventFullscreenIcon,
	EventPasteIcon,
	EventTabSwitchIcon,
	EventWindowFocusIcon,
	RatingStarIcon,
	WarningTriangleIcon,
} from "@/components/icons/role-assessment";
import { SkeletonBlock } from "@/components/role-assessment/ui/Basics";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaModal, RaModalTitle } from "@/components/role-assessment/ui/Modal";
import { NOTE_MAX } from "@/lib/api/role-assessment";
import { getErrorMessage } from "@/lib/api-errors";
import { PROCTORING_EVENTS } from "@/lib/constants/roleAssessment";
import { formatDateBullet, formatPersonShort } from "@/lib/format";
import {
	useAddInvitationNote,
	useRateInvitation,
} from "@/lib/hooks/role-assessment/mutations";
import {
	useInvitationNotes,
	useInvitationRate,
} from "@/lib/hooks/role-assessment/queries";
import {
	canSubmitRating,
	formatSpentTime,
	proctoringRow,
} from "@/lib/role-assessment/result";
import type {
	InvitationNote,
	InvitationResult,
} from "@/lib/types/role-assessment";
import { cn } from "@/lib/utils";

// Staging үр дүнгийн баруун багана (📦 module 1043): анхааруулга, төлөв, явцын хяналт,
// од үнэлгээ (`P`), тэмдэглэл (`V`), "Санамж" modal (`M`).

const CARD = "rounded-2xl border border-Stroke-700 p-4 sm:p-6";

// --- Анхааруулга + Санамж ---

const REMINDER_SECTIONS: { title: string; items: string[] }[] = [
	{
		title: "Тайлангийн зорилго",
		items: [
			"Энэхүү тайлан нь сонгон шалгаруулалтын шийдвэр гаргахад дэмжлэг үзүүлэх үүднээс өгөгдөлд тулгуурлан нэмэлт мэдээлэл өгөх зориулалттай бөгөөд ярилцлага, туршлага, мэргэжлийн ур чадвар зэрэг бусад шалгуурыг орлохгүй болно.",
		],
	},
	{
		title: "Тайлан ашиглах зарчим",
		items: [
			"Тайланг зөвхөн албан хэрэгцээний зорилгоор, мэргэжлийн хүрээнд ашиглана.",
			"Тайланд дурдсан ажил горилогчийн зан төлөвийн онцлог, тайлангийн дүгнэлтийн тоон мэдээллийг зүй бусаар ашиглах, ажил горилогчийн алдар нэр, эрхэм чанарт халдахгүй, аливаа хэлбэрийн ялгаварлан гадуурхалтыг үүсгэхгүй байхыг зорино.",
			"Тайланг ажилд авах, албан тушаал дэвшүүлэх, эсвэл татгалзах цорын ганц шалгуур болгон ашиглахад тохиромжгүй.",
			"Тайлан нь хувь хүний онцлог чанар, чадварыг танин мэдэхэд зориулагдах бөгөөд тогтсон шинж, нарийн эмнэл зүйн мэргэжлийн онош биш болно.",
			"Тайланд тухайн ажил горилогчийн давуу болон хөгжүүлэх шаардлагатай талууд тусгагдсан тул тэдгээрийг ажлын шаардлагатай нь уялдуулан тухайн ажил горилогч болон оролцогч талуудад тайлбарлахыг зөвлөж байна.",
		],
	},
	{
		title: "Өгөгдөл хамгаалалт ба нууцлал",
		items: [
			"Энэхүү тайланд багтах мэдээлэл нь нууц бөгөөд Хувь хүний мэдээлэл хамгаалах тухай хуулиар хамгаалагдана.",
			"Тайланг татан авах, хадгалах тохиолдолд ажил олгогч байгууллага мэдээллийн аюулгүй байдлыг хангах үүрэгтэй.",
			"Судалгааны үр дүнг зөвхөн тухайн байгууллагын сонгон шалгаруулах үйл явцад ашиглах бөгөөд бусад зорилгоор дамжуулах, хуулбарлахыг хатуу хориглоно. Сонгон шалгаруулалтын тест болон үр дүнгийн тайлан нь Оптимал Эн Макс ХХК-ийн өмч байна.",
		],
	},
	{
		title: "Хариуцлагын мэдэгдэл",
		items: [
			"MindX+ платформ нь сонгон шалгаруулалтад ашиглаж буй судалгааны аргачлал, үнэн зөв байдлыг шинжлэх ухааны түвшинд хангаж ажилладаг. Гэвч энэхүү мэдээлэлд үндэслэн гаргасан аливаа шийдвэр, дүгнэлтэд MindX+ хариуцлага хүлээхгүй болно.",
		],
	},
];

function ReminderModal({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	return (
		<RaModal
			open={open}
			onClose={onClose}
			width={800}
			bare
			className="gap-y-0 overflow-hidden rounded-[28px] p-6 shadow-[0px_4px_6px_-4px_rgba(0,0,0,0.1),0px_10px_15px_0px_rgba(0,0,0,0.1)]"
			header={
				<div className="flex h-14 min-h-14 shrink-0 items-center justify-between px-4 py-1">
					<RaModalTitle className="font-bold text-[20px] text-TextColor-main leading-6">
						Санамж
					</RaModalTitle>
					<RaButton
						variant="ghost"
						className="-mr-2 shrink-0"
						prefixIcon={<CloseIcon className="!size-7 text-TextColor-main" />}
						onClick={onClose}
						ariaLabel="Хаах"
					/>
				</div>
			}
			footer={
				<div className="mt-6 flex items-center justify-end">
					<RaButton variant="outline" title="Хаах" onClick={onClose} />
				</div>
			}
		>
			<div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-4">
				{REMINDER_SECTIONS.map((section) => (
					<div key={section.title} className="flex flex-col gap-2">
						<p className="font-bold text-[16px] text-TextColor-main leading-5 tracking-[0.2px]">
							{section.title}
						</p>
						<ul className="list-disc space-y-1 pl-5 font-medium text-[14px] text-TextColor-secondary leading-[1.4] tracking-[0.2px]">
							{section.items.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</RaModal>
	);
}

export function WarningCard() {
	const [open, setOpen] = useState(false);
	return (
		<div className={cn(CARD, "space-y-2")}>
			<div className="flex items-center gap-1">
				<WarningTriangleIcon />
				<span className="font-bold text-[16px] text-Semantic-error500 leading-5">
					Анхааруулга
				</span>
			</div>
			<p className="font-normal text-[14px] text-TextColor-secondary leading-[140%]">
				Сэтгэл зүйн үнэлгээний үр дүнг зөвхөн ажилд авах эцсийн шийдвэрийн
				үндэслэл болгон ашиглахыг хориглоно. Энэхүү үнэлгээ нь бусад мэдээлэлтэй
				хослуулан, иж бүрэн дүгнэлт гаргахад ашиглагдах ёстой.
			</p>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className="rounded-sm font-medium text-[14px] text-TextColor-secondary underline outline-none transition-colors hover:text-TextColor-main focus-visible:ring-2 focus-visible:ring-Primary/40"
			>
				Санамж унших
			</button>
			<ReminderModal open={open} onClose={() => setOpen(false)} />
		</div>
	);
}

// --- Төлөв ---

const STATUS_PILL =
	"inline-flex items-center gap-2 rounded-full border border-Gray-300 px-3 py-1 font-medium text-[14px] text-Gray-900 leading-[1.4]";

/** Staging `f`: үр дүнгийн хуудасны төлөвийн pill (dashboard-ынхаас өөр). */
function ResultStatusPill({ status }: { status?: string | null }) {
	switch (status) {
		case "COMPLETED":
			return (
				<span className={STATUS_PILL}>
					<svg
						aria-hidden="true"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
					>
						<path
							d="M5 8L7 10L11 6M14.667 8C14.667 11.681 11.682 14.666 8 14.666C4.318 14.666 1.333 11.681 1.333 8C1.333 4.318 4.318 1.333 8 1.333C11.682 1.333 14.667 4.318 14.667 8Z"
							stroke="#72BF0F"
							strokeWidth="1.33"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					Дууссан
				</span>
			);
		case "STARTED":
			return (
				<span className={STATUS_PILL}>
					<span aria-hidden="true" className="size-2 rounded-full bg-Primary" />
					Эхэлсэн
				</span>
			);
		case "PENDING":
			return (
				<span className={STATUS_PILL}>
					<svg
						aria-hidden="true"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
					>
						<circle
							cx="8"
							cy="8"
							r="6.667"
							stroke="#FFD95C"
							strokeWidth="1.33"
							strokeLinecap="round"
							strokeDasharray="2.67 2.67"
						/>
						<circle cx="8" cy="8" r="3" fill="#FFD95C" />
					</svg>
					Уригдсан
				</span>
			);
		case "EXPIRED":
			return (
				<span className={STATUS_PILL}>
					<svg
						aria-hidden="true"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
					>
						<path
							d="M5.333 8H10.667M14.667 8C14.667 11.681 11.682 14.666 8 14.666C4.318 14.666 1.333 11.681 1.333 8C1.333 4.318 4.318 1.333 8 1.333C11.682 1.333 14.667 4.318 14.667 8Z"
							stroke="#FF775C"
							strokeWidth="1.33"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					Хугацаа дууссан
				</span>
			);
		default:
			return (
				<span className={cn(STATUS_PILL, "text-TextColor-third")}>
					{status || "---"}
				</span>
			);
	}
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<dt className="font-medium text-TextColor-secondary leading-5">
				{label}
			</dt>
			<dd className="text-right font-bold text-TextColor-main leading-5">
				{value}
			</dd>
		</div>
	);
}

export function StatusCard({ result }: { result: InvitationResult }) {
	const completedAt = result.assessment?.completedAt;
	return (
		<div className={cn(CARD, "space-y-4")}>
			<div className="flex items-center justify-between">
				<span className="font-medium text-TextColor-secondary text-base leading-5">
					Төлөв
				</span>
				<ResultStatusPill status={result.status} />
			</div>
			<div className="h-px bg-Stroke-500" />
			<dl className="space-y-3">
				<InfoRow
					label="Урьсан"
					value={formatPersonShort(result.invitedBy) || "---"}
				/>
				<InfoRow
					label="Урьсан огноо"
					value={formatDateBullet(result.createdAt)}
				/>
				<InfoRow
					label="Бөглөсөн огноо"
					value={completedAt ? formatDateBullet(completedAt) : "--- • ---"}
				/>
				<InfoRow
					label="Зарцуулсан хугацаа"
					value={formatSpentTime(result.assessment?.spendingTime)}
				/>
			</dl>
		</div>
	);
}

// --- Явцын хяналт ---

const EVENT_ICONS: Record<string, ReactNode> = {
	FULLSCREEN_EXIT: <EventFullscreenIcon />,
	PAGE_VISIBILITY_HIDDEN: <EventTabSwitchIcon />,
	WINDOW_FOCUS_LOST: <EventWindowFocusIcon />,
	COPY: <EventCopyIcon />,
	PASTE: <EventPasteIcon />,
};

export function ProctoringCard({ result }: { result: InvitationResult }) {
	const summary = result.assessment?.eventSummary;
	return (
		<div className="flex flex-col gap-6 rounded-2xl border border-Stroke-700 p-6">
			<div className="flex items-center gap-3">
				<p className="font-bold text-[16px] text-TextColor-main leading-5 tracking-[0.2px]">
					Явцын хяналт
				</p>
				<BadgeCheckIcon />
			</div>
			{PROCTORING_EVENTS.map((def) => {
				const row = proctoringRow(summary, def);
				return (
					<div
						key={def.key}
						className="flex w-full items-center justify-between"
					>
						<div className="flex items-center gap-2 py-1">
							<div className="flex size-6 shrink-0 items-center justify-center">
								{EVENT_ICONS[def.key]}
							</div>
							<div className="flex flex-col gap-0.5 tracking-[0.2px]">
								<p className="font-medium text-[16px] text-TextColor-main leading-5">
									{def.title}
								</p>
								<p className="font-medium text-[14px] text-TextColor-third leading-[1.4]">
									{def.description}
								</p>
							</div>
						</div>
						<div className="flex shrink-0 flex-col items-end justify-center gap-0.5 tracking-[0.2px]">
							<p className="font-extrabold text-[16px] text-TextColor-main leading-5">
								{row.count}
							</p>
							{row.duration && (
								<p className="font-medium text-[14px] text-TextColor-third leading-[1.4]">
									{row.duration}
								</p>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}

// --- Од үнэлгээ ---

const STARS = [1, 2, 3, 4, 5] as const;

export function RatingCard({ invitationId }: { invitationId: string }) {
	const rate = useInvitationRate(invitationId);
	const mutation = useRateInvitation(invitationId);
	const myPoints = rate.data?.myPoints ?? 0;
	// Сервер утга ирэх/шинэчлэгдэхэд сонголтыг дагуулна (staging useEffect-тэй ижил)
	const [synced, setSynced] = useState(myPoints);
	const [selected, setSelected] = useState(myPoints);
	if (synced !== myPoints) {
		setSynced(myPoints);
		setSelected(myPoints);
	}
	const [hover, setHover] = useState(0);
	const avg = rate.data?.avgPoints ?? 0;
	const count = rate.data?.count ?? 0;

	return (
		<div className={cn(CARD, "space-y-4")}>
			<p className="rounded-xl bg-Gray-50 px-4 py-3 font-medium text-[14px] text-TextColor-secondary leading-[1.4] tracking-[0.2px]">
				Та үр дүнтэй танилцаж талентэд өөрийн дүгнэлтээр үнэлгээ өгөөрэй.
			</p>
			{rate.isError ? (
				<p role="alert" className="text-[14px] text-Semantic-error500">
					{getErrorMessage(rate.error, "Үнэлгээ авахад алдаа гарлаа")}
				</p>
			) : (
				<div className="flex items-center justify-center gap-3 rounded-xl bg-Primary-softBg px-4 py-6">
					{rate.isPending ? (
						<SkeletonBlock className="h-8 w-40" />
					) : (
						<>
							<p className="font-extrabold text-[32px] text-TextColor-main leading-none">
								{avg.toFixed(1)}
							</p>
							<div className="flex flex-col items-start gap-1">
								<div
									className="flex items-center gap-1 text-Primary"
									role="img"
									aria-label={`Дундаж ${avg.toFixed(1)} од`}
								>
									{STARS.map((n) => (
										<RatingStarIcon
											key={n}
											filled={n <= Math.round(avg)}
											className="size-4"
										/>
									))}
								</div>
								<p className="font-medium text-[14px] text-TextColor-third leading-[1.4] tracking-[0.2px]">
									нийт {count} үнэлгээ
								</p>
							</div>
						</>
					)}
				</div>
			)}
			<div className="flex items-center gap-2">
				<fieldset
					className="flex items-center gap-2"
					onMouseLeave={() => setHover(0)}
				>
					<legend className="sr-only">Өөрийн үнэлгээ</legend>
					{STARS.map((n) => {
						const lit = n <= (hover || selected);
						return (
							<button
								key={n}
								type="button"
								className={cn(
									"flex size-10 shrink-0 items-center justify-center rounded-lg bg-Primary-softBg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-Primary/40 disabled:cursor-not-allowed",
									lit ? "text-Primary" : "text-Stroke-700",
								)}
								disabled={mutation.isPending || rate.isPending}
								onMouseEnter={() => setHover(n)}
								onClick={() => setSelected(n)}
								aria-label={`${n} одтой үнэлгээ`}
								aria-pressed={selected === n}
							>
								<RatingStarIcon filled={lit} className="size-5" />
							</button>
						);
					})}
				</fieldset>
				<RaButton
					variant="outline"
					size="small"
					title={mutation.isPending ? "Хадгалж байна..." : "Үнэлгээ өгөх"}
					className="flex-1 justify-center"
					disabled={!canSubmitRating(selected, myPoints, mutation.isPending)}
					onClick={() => mutation.mutate(selected)}
				/>
			</div>
		</div>
	);
}

// --- Тэмдэглэл ---

function NoteItem({ note }: { note: InvitationNote }) {
	return (
		<div className="rounded-xl bg-Gray-50 p-4">
			<p className="font-bold text-[14px] text-TextColor-main leading-[1.4] tracking-[0.2px]">
				{formatPersonShort(note.createdBy) || "---"}
			</p>
			<p className="mt-1 font-medium text-[14px] text-TextColor-third leading-[1.4] tracking-[0.2px]">
				{formatDateBullet(note.createdAt)}
			</p>
			<p className="mt-3 whitespace-pre-wrap break-words text-[14px] text-TextColor-secondary leading-[1.4] tracking-[0.2px]">
				{note.note}
			</p>
		</div>
	);
}

export function NotesCard({ invitationId }: { invitationId: string }) {
	const notes = useInvitationNotes(invitationId);
	const mutation = useAddInvitationNote(invitationId);
	const [text, setText] = useState("");
	const [expanded, setExpanded] = useState(false);
	const trimmed = text.trim();
	const list = notes.data ?? [];

	return (
		<div className={cn(CARD, "space-y-4")}>
			<label
				htmlFor="ra-note"
				className="block font-bold text-[16px] text-TextColor-main leading-5 tracking-[0.2px]"
			>
				Тэмдэглэл үлдээх
			</label>
			<textarea
				id="ra-note"
				className="min-h-[120px] w-full resize-none break-words rounded-md border border-Stroke-700 px-3 py-2 text-[14px] text-TextColor-main leading-[1.4] tracking-[0.2px] transition-colors placeholder:text-TextColor-third focus:border-Primary focus:outline-none"
				placeholder="Энд бичнэ үү..."
				maxLength={NOTE_MAX}
				value={text}
				onChange={(e) => setText(e.target.value)}
				aria-describedby="ra-note-count"
			/>
			<div className="flex items-center justify-between gap-3">
				<p
					id="ra-note-count"
					className="text-[13px] text-TextColor-third leading-4"
				>
					{text.length}/{NOTE_MAX}
				</p>
				<RaButton
					variant="primary"
					size="small"
					title={mutation.isPending ? "Хадгалж байна..." : "Хадгалах"}
					disabled={!trimmed || mutation.isPending}
					onClick={() =>
						mutation.mutate(trimmed, {
							onSuccess: () => {
								setText("");
								setExpanded(true);
							},
						})
					}
				/>
			</div>
			<button
				type="button"
				className="flex w-full items-center justify-between rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-Primary/40"
				onClick={() => setExpanded((v) => !v)}
				aria-expanded={expanded}
				aria-controls="ra-notes-list"
			>
				<span className="font-bold text-[16px] text-TextColor-main leading-5 tracking-[0.2px]">
					Бусад тэмдэглэл
				</span>
				<ChevronSmallIcon
					className={cn(
						"size-5 shrink-0 text-TextColor-main transition-transform",
						expanded && "rotate-180",
					)}
				/>
			</button>
			{expanded && (
				<div id="ra-notes-list">
					{notes.isPending ? (
						<SkeletonBlock className="h-20 w-full rounded-xl" />
					) : notes.isError ? (
						<p role="alert" className="text-[14px] text-Semantic-error500">
							{getErrorMessage(notes.error, "Тэмдэглэл авахад алдаа гарлаа")}
						</p>
					) : list.length > 0 ? (
						<div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
							{list.map((note) => (
								<NoteItem key={note.id} note={note} />
							))}
						</div>
					) : (
						<p className="font-medium text-[14px] text-TextColor-third leading-[1.4] tracking-[0.2px]">
							Тэмдэглэл байхгүй байна.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
