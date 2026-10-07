"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
	EyeIcon,
	PlusIcon,
	TrashIcon,
} from "@/components/icons/role-assessment";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { TextField } from "@/components/role-assessment/ui/TextField";
import { LOGO_MAX_BYTES } from "@/lib/api/design";
import { RECRUITMENT_INFO_MAX } from "@/lib/api/role-assessment";
import { useRecruitmentDesign } from "@/lib/hooks/role-assessment/queries";
import {
	useRemoveLogo,
	useUploadLogo,
} from "@/lib/hooks/role-assessment/wizardMutations";
import type { InfoForm } from "@/lib/role-assessment/wizard";
import { raRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "./RichTextEditor";

// Staging алхам 1 (📦 `S`) + лого (📦 `_`, GET designs/RECRUITMENT/{id}).

const LABEL = "block text-[14px] text-TextColor-main leading-[140%]";

export function StepInfo({
	recruitmentId,
	form,
	onChange,
	readOnly,
}: {
	recruitmentId: string;
	form: InfoForm;
	onChange: (field: keyof InfoForm, value: string) => void;
	readOnly: boolean;
}) {
	const openPreview = () =>
		window.open(
			raRoutes.preview(recruitmentId),
			"_blank",
			"noopener,noreferrer",
		);
	return (
		<>
			<div>
				<h2 className="font-medium text-Gray-900 text-[20px] leading-6">
					Ерөнхий мэдээлэл оруулах
				</h2>
				<p className="mt-[13px] font-medium text-[14px] text-TextColor-secondary leading-[140%]">
					Талентийн үнэлгээнд хамруулах ажлын байрны нэр болон товч тайлбарыг
					оруулна уу. Энэ мэдээлэл нь талентүүдэд харагдах мэдээлэл юм.
				</p>
			</div>
			<div className="mt-[33px] space-y-6">
				<div>
					<label htmlFor="ra-job-title" className={LABEL}>
						Ажлын байрны нэр*
					</label>
					<TextField
						id="ra-job-title"
						required
						value={form.jobTitle}
						onChange={(e) => onChange("jobTitle", e.target.value)}
						placeholder="Жишээ нь 'Хүний нөөцийн менежер'"
						readOnly={readOnly}
						maxLength={RECRUITMENT_INFO_MAX}
					/>
				</div>
				<div>
					<p className={cn(LABEL, "mb-2")} id="ra-job-description-label">
						Нэмэлт мэдээлэл *
					</p>
					<RichTextEditor
						value={form.jobDescription}
						onChange={(html) => onChange("jobDescription", html)}
						readOnly={readOnly}
						placeholder="Тайлбар оруулах"
						ariaLabel="Нэмэлт мэдээлэл"
						ariaRequired
					/>
				</div>
			</div>
			<div className="mt-7 h-[1px] w-full bg-Stroke-500" />
			<div className="pt-5">
				<h2 className="font-medium text-Gray-900 text-[20px] leading-[24px]">
					Компанийн танилцуулга
				</h2>
				<p className="font-medium text-[14px] text-TextColor-secondary leading-[140%]">
					Талентийн үнэлгээ явуулж буй байгууллагын нэр болон товч танилцуулгыг
					оруулна уу. Энэ мэдээлэл нь оролцогчдод харагдах болно.
				</p>
				<div className="mt-7 space-y-6">
					<div>
						<label htmlFor="ra-company-name" className={LABEL}>
							Компанийн нэр
						</label>
						<TextField
							id="ra-company-name"
							value={form.companyName}
							onChange={(e) => onChange("companyName", e.target.value)}
							readOnly={readOnly}
							maxLength={RECRUITMENT_INFO_MAX}
						/>
					</div>
					<div>
						<p className={cn(LABEL, "mb-2")}>Компанийн тухай</p>
						<RichTextEditor
							value={form.companyDescription}
							onChange={(html) => onChange("companyDescription", html)}
							readOnly={readOnly}
							placeholder="Ерөнхий мэдээлэл оруулах"
							ariaLabel="Компанийн тухай"
						/>
					</div>
				</div>
			</div>
			<div className="pt-5">
				<h2 className="font-medium text-Gray-900 text-[20px] leading-[24px]">
					Лого
				</h2>
				<p className="font-medium text-[14px] text-TextColor-secondary leading-[140%]">
					Энэ лого нь тестийн эхлэх хуудсанд харагдана
				</p>
				<div className="flex w-full flex-col gap-4 md:flex-row md:items-start">
					<div className="w-full min-w-0 md:w-1/2 md:max-w-[min(50%,400px)]">
						<LogoUploader recruitmentId={recruitmentId} readOnly={readOnly} />
					</div>
					<div className="relative z-10 flex shrink-0 items-center pt-1 md:pt-0">
						<RaButton
							variant="outline"
							title="Харагдац"
							prefixIcon={<EyeIcon />}
							onClick={openPreview}
						/>
					</div>
				</div>
			</div>
		</>
	);
}

/** Staging лого (📦 `_`): PNG/JPEG ≤200KB, сонгомогц upload, устгах. */
function LogoUploader({
	recruitmentId,
	readOnly,
}: {
	recruitmentId: string;
	readOnly: boolean;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const design = useRecruitmentDesign(recruitmentId);
	const upload = useUploadLogo(recruitmentId);
	const remove = useRemoveLogo(recruitmentId);
	const [localPreview, setLocalPreview] = useState<string | null>(null);
	const busy = upload.isPending || remove.isPending;
	const preview = upload.isPending
		? localPreview
		: (design.data?.logoUrl ?? null);

	const onFile = (file: File | undefined) => {
		if (!file) return;
		if (file.size > LOGO_MAX_BYTES) {
			toast.error("Зураг 200KB-аас хэтэрч болохгүй!");
			return;
		}
		if (!/^image\/(png|jpeg|jpg)$/.test(file.type)) {
			toast.error("Зөвхөн PNG, JPEG формат зөвшөөрөгдөнө!");
			return;
		}
		const reader = new FileReader();
		reader.onload = () => {
			const url = typeof reader.result === "string" ? reader.result : "";
			setLocalPreview(url);
			upload.mutate(
				{ file, previewUrl: url },
				{ onSettled: () => setLocalPreview(null) },
			);
		};
		reader.readAsDataURL(file);
	};

	return (
		<div className="mt-4">
			<input
				ref={inputRef}
				type="file"
				accept="image/png,image/jpeg,image/jpg"
				className="hidden"
				aria-label="Лого сонгох"
				onChange={(e) => {
					onFile(e.target.files?.[0]);
					e.target.value = "";
				}}
				disabled={readOnly || busy}
			/>
			{preview ? (
				<div className="relative h-[200px] w-full max-w-[400px] rounded-[6px] border border-Stroke-700 border-dashed">
					{busy && (
						<div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75">
							<div className="h-8 w-8 animate-spin rounded-full border-2 border-Gray-900 border-t-transparent" />
						</div>
					)}
					<Image
						src={preview}
						fill
						className="object-contain p-4"
						alt="Байршуулсан лого"
						unoptimized
					/>
					{!readOnly && (
						<button
							type="button"
							aria-label="Лого устгах"
							onClick={() => remove.mutate(design.data?.id ?? 0)}
							className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-Stroke-800 bg-white transition-colors hover:bg-gray-50"
							disabled={busy}
						>
							{remove.isPending ? (
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
							) : (
								<TrashIcon className="h-4 w-4 text-red-500" />
							)}
						</button>
					)}
				</div>
			) : (
				<button
					type="button"
					onClick={() => !readOnly && inputRef.current?.click()}
					disabled={readOnly || busy}
					className={cn(
						"flex h-[200px] w-full max-w-[400px] flex-col items-center justify-center rounded-[6px] border border-Stroke-700 border-dashed hover:bg-Ghost-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40",
						readOnly || busy
							? "cursor-not-allowed opacity-50"
							: "cursor-pointer hover:bg-opacity-80",
					)}
				>
					<div
						style={{ boxShadow: "0px 0px 8px 1px #00D0FF40" }}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-Gray-900"
					>
						{upload.isPending ? (
							<div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
						) : (
							<PlusIcon className="h-5 w-5 text-white" />
						)}
					</div>
					<p className="mt-1 w-full text-center text-[14px] text-TextColor-main leading-[140%]">
						Зураг оруулах
					</p>
				</button>
			)}
		</div>
	);
}
