import { StatusClosedCheckIcon } from "@/components/icons/staging";

// Staging-ийн статус badge-ууд (📦 bundle, module 9378: `UU` — шинжилгээ, `Hp` — талентийн үнэлгээ).

const SUSPENDED_TOOLTIP_CLASS =
	"absolute bottom-full left-0 z-50 mb-2 hidden w-max max-w-[240px] group-hover:block";

/** Шинжилгээний статус (staging `UU`) */
export function SurveyStatusBadge({ status }: { status?: string }) {
	switch (status) {
		case "CREATED":
			return (
				<div className="flex h-7 items-center justify-start gap-2 rounded-lg border border-Gray-200 pr-3 pl-2 font-medium text-[14px] text-black leading-[140%]">
					<div className="size-2 rounded-full bg-Semantic-warning500" />
					Үүссэн
				</div>
			);
		case "PUBLISHED":
			return (
				<div className="flex h-7 items-center gap-2 rounded-lg border border-Gray-200 bg-[#FDFDFD] pr-3 pl-2 font-medium text-[14px] text-black leading-5">
					<div className="h-[6px] w-[6px] rounded-full bg-Semantic-success500" />
					Идэвхтэй
				</div>
			);
		case "PUBLISHING":
			return (
				<div className="flex items-center justify-start gap-2 rounded-lg border border-Gray-300 px-3 py-1 font-medium text-Gray-950 text-[14px] leading-[140%]">
					<div className="size-2 rounded-full bg-[#4d4c4b]" />
					PUBLISHING
				</div>
			);
		case "CLOSED":
			return (
				<div className="flex h-7 items-center gap-2 rounded-lg bg-Gray-100 pr-3 pl-2 font-medium text-Gray-700 text-[14px] leading-5">
					<StatusClosedCheckIcon className="size-4" />
					Хаагдсан
				</div>
			);
		case "SUSPENDED":
			return (
				<div className="group relative inline-flex">
					<div className="flex h-7 items-center gap-2 rounded-lg border border-Gray-200 bg-[#FDFDFD] pr-3 pl-2 font-medium text-[14px] text-black leading-5">
						<div className="h-[6px] w-[6px] rounded-full bg-[#f32222]" />
						Саатсан
					</div>
					<div className={SUSPENDED_TOOLTIP_CLASS}>
						<div className="rounded-lg bg-Gray-900 px-3 py-2 text-[12px] text-white leading-[1.4] shadow-lg">
							Шинжилгээг нийтлэх үед алдаа гарсан байна. Та дахин шинжилгээ
							үүсгэнэ үү.
						</div>
					</div>
				</div>
			);
		default:
			return <div>Тодорхойгүй</div>;
	}
}

const PILL =
	"flex items-center justify-start gap-2 rounded-lg border border-Gray-300 px-3 py-1 font-medium text-Gray-950 text-[14px] leading-[140%]";

/** Талентийн үнэлгээний статус (staging `Hp`) */
export function RecruitmentStatusPill({ status }: { status?: string }) {
	switch (status) {
		case "CREATED":
			return (
				<div className={PILL}>
					<div className="size-2 rounded-full bg-Semantic-warning500" />
					Үүссэн
				</div>
			);
		case "PUBLISHED":
			return (
				<div className={PILL}>
					<div className="size-2 rounded-full bg-Semantic-success500" />
					Идэвхтэй
				</div>
			);
		case "CLOSED":
			return (
				<div className="flex h-7 items-center gap-2 rounded-lg bg-Gray-100 pr-3 pl-2 font-medium text-Gray-700 text-[14px] leading-5">
					<StatusClosedCheckIcon className="size-4" />
					Хаагдсан
				</div>
			);
		case "PUBLISHING":
			return (
				<div className={PILL}>
					<div className="size-2 rounded-full bg-[#4d4c4b]" />
					PUBLISHING
				</div>
			);
		case "SUSPENDED":
			return (
				<div className="group relative inline-flex">
					<div className="flex items-center gap-x-2 rounded-lg border-[#f32222]/30 border-[1.5px] bg-[#fff0f0] px-2 py-[2px] text-[#f32222] text-[14px] leading-5">
						<div className="h-[6px] w-[6px] rounded-full bg-[#f32222]" />
						Саатсан
					</div>
					<div className={SUSPENDED_TOOLTIP_CLASS}>
						<div className="rounded-lg bg-Gray-900 px-3 py-2 text-[12px] text-white leading-[1.4] shadow-lg">
							Талентийн үнэлгээг нийтлэх үед алдаа гарсан байна. Та дахин
							шинжилгээ үүсгэнэ үү.
						</div>
					</div>
				</div>
			);
		default:
			return <div>Тодорхойгүй</div>;
	}
}
