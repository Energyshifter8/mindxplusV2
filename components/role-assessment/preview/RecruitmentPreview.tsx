"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	MindXLogo,
	PreviewClockIcon,
	PreviewHelpIcon,
	PreviewQuestionsIcon,
	PreviewTestsIcon,
	PreviewTimeIcon,
} from "@/components/icons/role-assessment";
import { RichTextView } from "@/components/role-assessment/RichTextView";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { getErrorMessage } from "@/lib/api-errors";
import { isCyrillicName, keepCyrillic } from "@/lib/format";
import {
	useCatalogTests,
	useRecruitmentDesign,
	useRecruitmentInformation,
	useRecruitmentQuestionIds,
	useRecruitmentTestIds,
} from "@/lib/hooks/role-assessment/queries";
import {
	RA_TITLES,
	useDocumentTitle,
} from "@/lib/hooks/role-assessment/useDocumentTitle";
import { clearDraft, readDraft } from "@/lib/role-assessment/draft";
import { orderByIds, sumDurations } from "@/lib/role-assessment/wizard";

// Staging /role-assessment/{id}/preview (📦 app/(editor)/…/preview): оролцогчид харагдах
// эхлэх урсгал. GET: design (алдааг үл тоомсорлоно), information, tests, questions
// зэрэг; тест байвал каталог. Ноорог (`ra_draft_{id}`) серверийн утгаас түрүүлнэ, хуудаснаас
// гарахад ноорог устгагдана (staging). Rich text: read-only Quill (D3).

type Screen =
	| "start"
	| "jobIntro"
	| "companyIntro"
	| "verification"
	| "readiness"
	| "testIntro";

const TEXT = "#10182B"; // theme LIGHT txtColor / optionTxtColor (📦 module 37740)
const CARD_SHADOW = { boxShadow: "0px 4px 16px 0px #C4CBE833" };

export function RecruitmentPreview({
	recruitmentId,
}: {
	recruitmentId: string;
}) {
	const id = recruitmentId;
	useDocumentTitle(RA_TITLES.preview);
	const [screen, setScreen] = useState<Screen>("start");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [confirmed, setConfirmed] = useState(false);

	const design = useRecruitmentDesign(id);
	const info = useRecruitmentInformation(id);
	const testIds = useRecruitmentTestIds(id, true);
	const questionIds = useRecruitmentQuestionIds(id, true);
	const testCount = testIds.data?.length ?? 0;
	const catalog = useCatalogTests("", testCount > 0);
	const [draft] = useState(() => readDraft(id));

	// Staging: хуудаснаас гарах/хаахад ноорогийг устгана
	useEffect(() => {
		const drop = () => clearDraft(id);
		window.addEventListener("beforeunload", drop);
		return () => {
			window.removeEventListener("beforeunload", drop);
			drop();
		};
	}, [id]);

	const data = useMemo(() => {
		if (!info.data) return null;
		const tests = orderByIds(
			testIds.data ?? [],
			(catalog.data ?? []).map((t) => ({
				id: t.id,
				questions: t.questionCount || 0,
				duration:
					t.minMinutes && t.maxMinutes
						? `${t.minMinutes}-${t.maxMinutes}`
						: String(t.minMinutes || t.maxMinutes || ""),
			})),
		);
		const sum = sumDurations(tests.map((t) => t.duration));
		const questionCount = questionIds.data?.length ?? 0;
		return {
			jobTitle: draft?.jobTitle ?? info.data.jobTitle ?? "Ажлын байр",
			jobDescription: draft?.jobDescription ?? info.data.jobDescription ?? "",
			companyName: draft?.companyName ?? info.data.companyName ?? "",
			companyDescription:
				draft?.companyDescription ?? info.data.companyDescription ?? "",
			logoUrl: design.data?.logoUrl?.trim() ? design.data.logoUrl : null,
			tests,
			questionCount,
			minMinutes: sum.min + 2 * questionCount || 30,
			maxMinutes: sum.max + 5 * questionCount || 40,
		};
	}, [
		info.data,
		catalog.data,
		testIds.data,
		questionIds.data,
		design.data,
		draft,
	]);

	const loading =
		info.isPending ||
		testIds.isPending ||
		questionIds.isPending ||
		design.isPending ||
		(testCount > 0 && catalog.isPending);
	const error =
		info.error ?? testIds.error ?? questionIds.error ?? catalog.error;

	if (loading) {
		return (
			<div
				className="flex h-screen w-full items-center justify-center"
				aria-busy="true"
			>
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-Primary border-t-transparent" />
				<span className="sr-only">Ачааллаж байна...</span>
			</div>
		);
	}

	const header = (
		<div
			className="z-20 flex h-14 shrink-0 flex-row items-center bg-white px-4"
			style={{ boxShadow: "0px 2px 8px 0px #0000000F" }}
		>
			{data?.logoUrl ? (
				<div className="relative h-10 w-[min(220px,55vw)] shrink-0">
					<Image
						src={data.logoUrl}
						alt=""
						fill
						className="object-contain object-left"
						sizes="220px"
						unoptimized
					/>
				</div>
			) : (
				<MindXLogo className="h-10 w-[94px] shrink-0" />
			)}
		</div>
	);

	if (error || !data) {
		return (
			<div className="flex h-screen flex-col items-center justify-center bg-[#F5F7FF] px-4">
				<div className="w-full">{header}</div>
				<p role="alert" className="mt-8 font-medium text-TextColor-main">
					{error
						? getErrorMessage(error, "Мэдээлэл ачаалахад алдаа гарлаа")
						: "Мэдээлэл олдсонгүй"}
				</p>
			</div>
		);
	}

	const firstTest = data.tests[0];
	const hasTests = data.tests.length > 0;
	const hasQuestions = data.questionCount > 0;
	const duration = `${data.minMinutes}-${data.maxMinutes}`;

	return (
		<div className="flex min-h-screen flex-col bg-[#F5F7FF]">
			{header}
			<div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-8">
				{screen === "start" && (
					<div
						className="mx-auto flex w-full max-w-[600px] flex-col items-center justify-center gap-y-5 rounded-2xl bg-white p-5 sm:gap-y-10 sm:p-10"
						style={CARD_SHADOW}
					>
						<div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:gap-6">
							<h1
								className="text-center font-bold text-2xl md:text-3xl"
								style={{ color: TEXT }}
							>
								mindX+ платформын Талент үнэлгээнд тавтай морилно уу.
							</h1>
							<p className="text-center" style={{ color: TEXT }}>
								mindX+ платформ нь бие хүний онцлог, зан төлөв, хандлага, ажлын
								хэв маягийг ойлгоход туслах шинжлэх ухаанд суурилсан
								үнэлгээнүүдийг санал болгодог.
							</p>
						</div>
						<RaButton title="Эхлэх" onClick={() => setScreen("jobIntro")} />
					</div>
				)}
				{(screen === "jobIntro" || screen === "companyIntro") && (
					<div
						className="flex w-full max-w-[704px] flex-col items-center overflow-hidden rounded-lg bg-white p-5 sm:rounded-2xl sm:p-10"
						style={CARD_SHADOW}
					>
						<div className="min-h-0 w-full flex-1 overflow-y-auto">
							<div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:gap-6">
								<h1
									className="break-words text-center font-bold text-xl md:text-3xl"
									style={{ color: TEXT }}
								>
									{screen === "jobIntro"
										? data.jobTitle || "Ажлын байр"
										: data.companyName.trim()
											? data.companyName
											: "Компанийн танилцуулга"}
								</h1>
								{(
									screen === "jobIntro"
										? data.jobDescription
										: data.companyDescription
								) ? (
									<div
										className="w-full min-w-0 max-w-full"
										style={{ color: TEXT }}
									>
										<RichTextView
											html={
												screen === "jobIntro"
													? data.jobDescription
													: data.companyDescription
											}
										/>
									</div>
								) : (
									<p
										className="text-center text-sm sm:text-base"
										style={{ color: TEXT }}
									>
										{screen === "jobIntro"
											? "Нэмэлт мэдээлэл оруулаагүй байна."
											: "Компанийн тухай мэдээлэл оруулаагүй байна."}
									</p>
								)}
							</div>
							<div className="flex w-full shrink-0 justify-end pt-5 sm:pt-10">
								<RaButton
									title="Үргэлжлүүлэх"
									onClick={() =>
										setScreen(
											screen === "jobIntro" ? "companyIntro" : "verification",
										)
									}
								/>
							</div>
						</div>
					</div>
				)}
				{screen === "verification" && (
					<div className="mx-auto flex w-full max-w-[600px] flex-col items-center justify-center rounded-2xl bg-white p-5 sm:p-10">
						<div className="flex w-full flex-col">
							<div className="w-full border-[#E4E8EF] border-b pb-3 sm:pb-5">
								<h1 className="font-semibold text-[#10182B] text-[16px] md:text-[20px]">
									Талентийг баталгаажуулах
								</h1>
								<p className="text-[#637389] text-[14px] leading-[140%]">
									Энэхүү үнэлгээ нь зөвхөн урилга хүлээж авсан талентэд
									зориулагдсан.
								</p>
							</div>
							<div className="mt-5 rounded-2xl border border-[#8CCDFF] bg-[#E0F2FF] p-4">
								<p className="font-bold text-[#001D33] text-[14px] leading-[140%]">
									Анхааруулга:
								</p>
								<ul className="mt-[10px] ml-1 list-inside list-disc space-y-1 text-[#001D33] text-sm leading-[140%]">
									<li>
										{'"Зөв/Буруу"'} гэж дүгнэхэд чиглээгүй, намайг илүү сайн
										таньж мэдэхэд зориулагдсаныг ойлгосон.
									</li>
									<li>Үнэлгээнд бие даан оролцоно.</li>
									<li>
										Асуултуудад өөрийн бодит туршлага, хандлага дээр үндэслэн
										хариулна.
									</li>
									<li>
										Миний өгсөн мэдээлэл Талентийн үнэлгээний зорилгоор
										ашиглагдана гэдгийг ойлгож байна.
									</li>
								</ul>
							</div>
							<div className="mt-5 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
								<div>
									<label
										htmlFor="ra-preview-last"
										className="mb-1 block text-[#10182B] text-sm leading-[140%] sm:mb-2"
									>
										Овог
									</label>
									<input
										id="ra-preview-last"
										placeholder="Овог оруулна уу"
										value={lastName}
										onChange={(e) => setLastName(keepCyrillic(e.target.value))}
										className="h-11 w-full rounded-lg border border-[#E4E8EF] px-4 text-[14px] text-[rgba(0,0,0,0.88)] outline-none focus:border-Primary sm:h-[52px]"
									/>
								</div>
								<div>
									<label
										htmlFor="ra-preview-first"
										className="mb-1 block text-[#10182B] text-sm leading-[140%] sm:mb-2"
									>
										Нэр
									</label>
									<input
										id="ra-preview-first"
										placeholder="Нэр оруулна уу"
										value={firstName}
										onChange={(e) => setFirstName(keepCyrillic(e.target.value))}
										className="h-11 w-full rounded-lg border border-[#E4E8EF] px-4 text-[14px] text-[rgba(0,0,0,0.88)] outline-none focus:border-Primary sm:h-[52px]"
									/>
								</div>
							</div>
							<label className="mt-3 flex cursor-pointer items-start gap-3 sm:mt-5">
								<input
									type="checkbox"
									checked={confirmed}
									onChange={(e) => setConfirmed(e.target.checked)}
									className="mt-1 h-4 w-4 rounded border-gray-300"
								/>
								<span className="font-medium text-[#10182B] text-sm leading-[140%]">
									Би урилга хүлээн авсан талент мөн гэдгээ баталгаажуулж, дараах
									анхааруулгуудыг ойлгож байгаагаа илэрхийлж байна.
								</span>
							</label>
						</div>
						<div className="mt-5 flex w-full justify-end">
							<RaButton
								disabled={!confirmed}
								title="Үргэлжлүүлэх"
								onClick={() => {
									if (!isCyrillicName(firstName) || !isCyrillicName(lastName)) {
										toast.error("Овог, нэрээ зөв оруулна уу", {
											duration: 5000,
										});
										return;
									}
									setScreen("readiness");
								}}
							/>
						</div>
					</div>
				)}
				{screen === "readiness" && (
					<div
						className="mx-auto flex w-full max-w-[931px] flex-col items-center justify-center gap-y-5 rounded-lg bg-white p-5 sm:gap-y-10 sm:rounded-2xl sm:p-10"
						style={CARD_SHADOW}
					>
						<div className="flex w-full min-w-0 max-w-full flex-col">
							<h1 className="font-bold text-TextColor-main text-xl leading-[140%] sm:text-2xl">
								Сайн байна уу {firstName || "?"}?
							</h1>
							<p className="mt-4 font-medium text-TextColor-secondary text-base leading-5 sm:text-[18px] sm:leading-[22px]">
								Таны бие хүний онцлог, ажлын хэв маяг, зөөлөн ур чадварыг
								ойлгоход зориулагдсан энэхүү үнэлгээний асуулга ойролцоогоор{" "}
								<b className="text-TextColor-main">[{duration}] минут</b>{" "}
								үргэлжилнэ. <br /> Үнэлгээг{" "}
								<b className="text-TextColor-main">зөвхөн нэг удаа</b> эхлүүлэх
								боломжтой тул эхлэхээсээ өмнө дараах бэлэн байдлыг хангасан
								эсэхээ шалгаарай.
							</p>
							<div className="mt-3 rounded-2xl border border-Semantic-warning500 bg-Semantic-warning100 p-4 font-medium text-[18px] text-TextColor-secondary leading-[22px]">
								<p className="inline-flex items-center gap-1 font-semibold text-Semantic-warning800 text-xl leading-6">
									<svg
										aria-hidden="true"
										width="36"
										height="36"
										viewBox="0 0 36 36"
										fill="none"
									>
										<path
											d="M4.08816 31.5C3.81316 31.5 3.56316 31.4313 3.33816 31.2938C3.11316 31.1563 2.93816 30.975 2.81316 30.75C2.68816 30.525 2.61941 30.2813 2.60691 30.0188C2.59441 29.7563 2.66316 29.5 2.81316 29.25L16.6882 5.25C16.8382 5 17.0319 4.8125 17.2694 4.6875C17.5069 4.5625 17.7507 4.5 18.0007 4.5C18.2507 4.5 18.4944 4.5625 18.7319 4.6875C18.9694 4.8125 19.1632 5 19.3132 5.25L33.1882 29.25C33.3382 29.5 33.4069 29.7563 33.3944 30.0188C33.3819 30.2813 33.3132 30.525 33.1882 30.75C33.0632 30.975 32.8882 31.1563 32.6632 31.2938C32.4382 31.4313 32.1882 31.5 31.9132 31.5H4.08816ZM6.67566 28.5H29.3257L18.0007 9L6.67566 28.5ZM18.0007 27C18.4257 27 18.7819 26.8563 19.0694 26.5688C19.3569 26.2812 19.5007 25.925 19.5007 25.5C19.5007 25.075 19.3569 24.7188 19.0694 24.4313C18.7819 24.1438 18.4257 24 18.0007 24C17.5757 24 17.2194 24.1438 16.9319 24.4313C16.6444 24.7188 16.5007 25.075 16.5007 25.5C16.5007 25.925 16.6444 26.2812 16.9319 26.5688C17.2194 26.8563 17.5757 27 18.0007 27ZM18.0007 22.5C18.4257 22.5 18.7819 22.3563 19.0694 22.0688C19.3569 21.7812 19.5007 21.425 19.5007 21V16.5C19.5007 16.075 19.3569 15.7188 19.0694 15.4312C18.7819 15.1438 18.4257 15 18.0007 15C17.5757 15 17.2194 15.1438 16.9319 15.4312C16.6444 15.7188 16.5007 16.075 16.5007 16.5V21C16.5007 21.425 16.6444 21.7812 16.9319 22.0688C17.2194 22.3563 17.5757 22.5 18.0007 22.5Z"
											fill="#FFD95C"
										/>
									</svg>
									Анхааруулга
								</p>
								<ul className="list-inside list-disc space-y-1">
									<li>Ариун цэврийн өрөөнд орсон байх</li>
									<li>Интернетийн холболт тогтвортой эсэхийг шалгах</li>
									<li>
										Цахилгаан тасалдахгүй, эсвэл төхөөрөмжийн цэнэг хангалттай
										байх
									</li>
									<li>Уух ус, шаардлагатай зүйлсээ ойрхон байрлуулах</li>
									<li>Анхаарал сарниулах мэдэгдлүүдийг унтраах</li>
									<li>Тайван, тухтай орчинд суух</li>
								</ul>
							</div>
							<div className="mt-5 grid w-full grid-cols-1 gap-2 sm:mt-10 sm:grid-cols-3">
								{[
									{
										icon: <PreviewTestsIcon />,
										value: data.tests.length,
										label: "Тестийн тоо",
									},
									{
										icon: <PreviewQuestionsIcon />,
										value: data.questionCount,
										label: "Нэмэлт асуулт",
									},
									{
										icon: <PreviewTimeIcon />,
										value: `${duration} мин`,
										label: "Нийт зарцуулах хугацаа",
									},
								].map((s) => (
									<div
										key={s.label}
										className="flex flex-row items-center gap-3 rounded-2xl border border-Stroke-600 px-4 py-3 sm:py-6"
									>
										{s.icon}
										<div className="flex flex-col">
											<span className="font-semibold text-2xl text-TextColor-main leading-[140%]">
												{s.value}
											</span>
											<span className="text-base text-TextColor-third leading-5">
												{s.label}
											</span>
										</div>
									</div>
								))}
							</div>
						</div>
						<div className="flex w-full justify-end">
							<RaButton
								title="Үргэлжлүүлэх"
								disabled={!hasTests && !hasQuestions}
								disabledReason={
									!hasTests && !hasQuestions
										? "Тест, нэмэлт асуулт сонгогдоогүй байна"
										: undefined
								}
								onClick={() => setScreen("testIntro")}
							/>
						</div>
					</div>
				)}
				{screen === "testIntro" && (firstTest || hasQuestions) && (
					<IntroCard
						title={
							firstTest
								? "Асуулга №1"
								: "Ажил олгогчоос тавьж буй нэмэлт асуултууд"
						}
						description={
							firstTest
								? "Зөв эсвэл буруу хариулт гэж байхгүй тул өөрийн бодит туршлага, хандлагад тохирох сонголтыг сонгоно уу."
								: "Нэмэлт асуултуудад өөрийн туршлага, хандлага, бодолд тулгуурлан хариулна уу. Таныг илүү сайн ойлгоход зориулагдсан бөгөөд зөв/буруу хариулт гэж байхгүй."
						}
						questionCount={
							firstTest
								? firstTest.questions > 0
									? firstTest.questions
									: "–"
								: data.questionCount
						}
						minutes={
							firstTest
								? sumDurations([firstTest.duration])
								: { min: 0, max: 0 }
						}
					/>
				)}
			</div>
		</div>
	);
}

function IntroCard({
	title,
	description,
	questionCount,
	minutes,
}: {
	title: string;
	description: string;
	questionCount: number | string;
	minutes: { min: number; max: number };
}) {
	const time =
		minutes.min > 0 || minutes.max > 0
			? `${minutes.min}-${minutes.max} мин`
			: "– мин";
	return (
		<div className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:justify-start md:pt-[100px]">
			<div
				className="flex w-full max-w-lg flex-col rounded-2xl bg-white p-6 md:p-10"
				style={CARD_SHADOW}
			>
				<h1 className="font-bold text-xl sm:text-2xl">{title}</h1>
				<div className="mt-5 flex flex-row gap-3">
					<div className="flex items-center gap-3 text-base">
						<PreviewHelpIcon />
						<span>{questionCount} асуулт</span>
					</div>
					<div className="flex items-center gap-3 text-base">
						<PreviewClockIcon />
						<span>{time}</span>
					</div>
				</div>
				<p className="mt-5 border-Stroke-600 border-t pt-5 text-base text-TextColor-main leading-5">
					{description}
				</p>
				<div className="mt-10 flex justify-end">
					<RaButton title="Үргэлжлүүлэх" onClick={() => window.close()} />
				</div>
			</div>
		</div>
	);
}
