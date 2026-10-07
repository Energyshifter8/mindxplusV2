"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SendIcon } from "@/components/icons/role-assessment";
import { EMAIL_SHAPE, searchTalentByEmail } from "@/lib/api/role-assessment";
import { getErrorMessage, getFieldErrors } from "@/lib/api-errors";
import { addDaysYmd, digitsOnly, keepCyrillic } from "@/lib/format";
import {
	useExtendInvitation,
	useInviteTalent,
} from "@/lib/hooks/role-assessment/mutations";
import { RaButton } from "./ui/Button";
import { RaDatePicker } from "./ui/DatePicker";
import { RaConfirmDialog, RaModal, RaModalTitle } from "./ui/Modal";
import { TextField } from "./ui/TextField";

// Staging "Талент урих / Дахин урих" modal (📦 module 4089). Нэг удаад нэг имэйл;
// амжилттай урьсны дараа форм цэвэрлэгдээд modal нээлттэй үлдэнэ (staging-тэй ижил).
// Урих нь ЖИНХЭНЭ имэйл илгээдэг — dry-run хамгаалалттай (DECISIONS.md D4).

export interface ReinviteTarget {
	invitationId: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber?: string | null;
}

interface FormState {
	email: string;
	lastName: string;
	firstName: string;
	phoneNumber: string;
	dueDate: string;
}

type Found = Omit<FormState, "dueDate">;

const trim = (v: string | null | undefined) => String(v ?? "").trim();

function initialForm(reinvite?: ReinviteTarget | null): FormState {
	return {
		email: reinvite?.email ?? "",
		lastName: reinvite?.lastName ?? "",
		firstName: reinvite?.firstName ?? "",
		phoneNumber: digitsOnly(reinvite?.phoneNumber),
		dueDate: addDaysYmd(1),
	};
}

const FIELD_CLASS = (readOnly: boolean) =>
	`!h-[38px] !text-TextColor-main ${readOnly ? "!bg-Gray-50" : ""}`;

export function InviteTalentModal({
	open,
	onClose,
	recruitmentId,
	reinvite,
}: {
	open: boolean;
	onClose: () => void;
	recruitmentId: string;
	reinvite?: ReinviteTarget | null;
}) {
	// `key` нь reinvite/open солигдоход форм шинээр эхлэх (staging useEffect-тэй ижил)
	return (
		<InviteTalentForm
			key={`${open}-${reinvite?.invitationId ?? "new"}`}
			open={open}
			onClose={onClose}
			recruitmentId={recruitmentId}
			reinvite={reinvite}
		/>
	);
}

function InviteTalentForm({
	open,
	onClose,
	recruitmentId,
	reinvite,
}: {
	open: boolean;
	onClose: () => void;
	recruitmentId: string;
	reinvite?: ReinviteTarget | null;
}) {
	const isReinvite = Boolean(reinvite);
	const [form, setForm] = useState<FormState>(() => initialForm(reinvite));
	const [found, setFound] = useState<Found | null>(null);
	const [searching, setSearching] = useState(false);
	const [confirmChanges, setConfirmChanges] = useState(false);
	const invite = useInviteTalent();
	const extend = useExtendInvitation(recruitmentId);
	const pending = isReinvite ? extend.isPending : invite.isPending;
	const fieldErrors = getFieldErrors(invite.error);

	const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
		setForm((prev) => ({ ...prev, [key]: value }));

	const close = () => {
		setForm(initialForm(null));
		setFound(null);
		setConfirmChanges(false);
		onClose();
	};

	/** Имэйлээр өмнө уригдсан талентыг олж бөглөнө (onBlur, 📦). */
	const lookup = async () => {
		if (isReinvite) return;
		const email = trim(form.email);
		if (!email || !EMAIL_SHAPE.test(email)) {
			setFound(null);
			return;
		}
		setSearching(true);
		try {
			const talent = await searchTalentByEmail(email);
			if (!talent) {
				setFound(null);
				return;
			}
			const next: Found = {
				email,
				firstName: trim(talent.firstName),
				lastName: trim(talent.lastName),
				phoneNumber: digitsOnly(talent.mobileNo ?? talent.phoneNumber),
			};
			setForm((prev) => ({
				...prev,
				firstName: next.firstName,
				lastName: next.lastName,
				phoneNumber: next.phoneNumber,
			}));
			setFound(next);
		} catch (error) {
			setFound(null);
			toast.error(getErrorMessage(error, "Имэйлээр хайхад алдаа гарлаа"));
		} finally {
			setSearching(false);
		}
	};

	const foundChanged = () =>
		found !== null &&
		!isReinvite &&
		trim(form.email) === trim(found.email) &&
		(trim(form.firstName) !== found.firstName ||
			trim(form.lastName) !== found.lastName ||
			trim(form.phoneNumber) !== found.phoneNumber);

	const send = () => {
		invite.mutate(
			{
				recruitmentId,
				email: form.email,
				firstName: form.firstName,
				lastName: form.lastName,
				phoneNumber: digitsOnly(form.phoneNumber) || null,
				dueDate: form.dueDate || addDaysYmd(7),
			},
			{
				onSuccess: () => {
					setForm(initialForm(null));
					setFound(null);
					setConfirmChanges(false);
				},
			},
		);
	};

	const submit = () => {
		if (isReinvite && reinvite) {
			extend.mutate(
				{
					invitationId: reinvite.invitationId,
					dueDate: form.dueDate || addDaysYmd(1),
				},
				{ onSuccess: close },
			);
			return;
		}
		if (!form.lastName.trim()) return void toast.warning("Овог оруулна уу");
		if (!form.firstName.trim()) return void toast.warning("Нэр оруулна уу");
		if (!form.email.trim()) return void toast.warning("Имэйл оруулна уу");
		if (!EMAIL_SHAPE.test(form.email.trim())) {
			return void toast.warning("Имэйл хаяг буруу байна!");
		}
		if (foundChanged()) {
			setConfirmChanges(true);
			return;
		}
		send();
	};

	return (
		<>
			<RaModal
				open={open}
				onClose={close}
				dismissible={!pending}
				header={
					<div>
						<div className="flex items-center justify-between">
							<RaModalTitle className="font-semibold text-[20px] text-TextColor-main leading-6">
								{isReinvite ? "Дахин урих" : "Талент урих"}
							</RaModalTitle>
						</div>
						<p className="text-[16px] text-TextColor-secondary leading-[140%]">
							{isReinvite
								? "Хугацаа дууссан урилгыг шинэчлэн дахин илгээнэ."
								: "Талентийн мэдээллийг оруулан талентийн үнэлгээнд оролцох урилга илгээнэ үү. Урилга имэйлээр илгээгдэнэ."}
						</p>
					</div>
				}
				footer={
					<div className="flex justify-end gap-3">
						<RaButton
							variant="outline"
							title="Хаах"
							onClick={close}
							disabled={pending || searching}
						/>
						<RaButton
							variant="primary"
							title={isReinvite ? "Дахин урих" : "Урилга илгээх"}
							onClick={submit}
							suffixIcon={<SendIcon />}
							className="w-[192px]"
							disabled={pending || searching}
						/>
					</div>
				}
			>
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						submit();
					}}
				>
					<TextField
						type="email"
						label="Имэйл хаяг"
						value={form.email}
						onChange={(e) => {
							const email = e.target.value;
							set("email", email);
							if (!isReinvite && found && trim(email) !== found.email)
								setFound(null);
						}}
						onBlur={lookup}
						placeholder="example@email.com"
						required
						readOnly={isReinvite}
						disabled={!isReinvite && searching}
						autoComplete="email"
						status={fieldErrors.email ? "error" : undefined}
						errorText={fieldErrors.email}
						className={FIELD_CLASS(isReinvite)}
					/>
					<div>
						<div className="grid grid-cols-2 gap-4">
							<TextField
								label="Овог"
								value={form.lastName}
								onChange={(e) => set("lastName", keepCyrillic(e.target.value))}
								placeholder="Овог"
								required
								readOnly={isReinvite}
								status={fieldErrors.lastName ? "error" : undefined}
								errorText={fieldErrors.lastName}
								className={FIELD_CLASS(isReinvite)}
							/>
							<TextField
								label="Нэр"
								value={form.firstName}
								onChange={(e) => set("firstName", keepCyrillic(e.target.value))}
								placeholder="Нэр"
								required
								readOnly={isReinvite}
								status={fieldErrors.firstName ? "error" : undefined}
								errorText={fieldErrors.firstName}
								className={FIELD_CLASS(isReinvite)}
							/>
						</div>
						<p className="mt-1.5 text-[14px] text-TextColor-third leading-[140%]">
							Талентийн овог, нэрийг крилл үсгээр бичнэ үү.
						</p>
					</div>
					<TextField
						label="Утасны дугаар"
						value={form.phoneNumber}
						onChange={(e) => set("phoneNumber", digitsOnly(e.target.value))}
						placeholder="99001122"
						maxLength={8}
						inputMode="numeric"
						autoComplete="tel"
						readOnly={isReinvite}
						status={fieldErrors.phoneNumber ? "error" : undefined}
						errorText={fieldErrors.phoneNumber}
						className={FIELD_CLASS(isReinvite)}
					/>
					<div>
						<RaDatePicker
							label="Урилгын дуусах хугацаа"
							value={form.dueDate}
							onChange={(v) => set("dueDate", v)}
							disableDays={0}
						/>
						<p className="mt-1.5 text-[14px] text-TextColor-third leading-[140%]">
							Талент дуусах хугацаанаас өмнө үнэлгээнд оролцоно. Товлосон өдөр
							урилга автоматаар хаагдана.
						</p>
					</div>
					{/* Enter-ээр илгээх (staging-д байхгүй, a11y) */}
					<button type="submit" hidden aria-hidden tabIndex={-1} />
				</form>
			</RaModal>
			<RaConfirmDialog
				open={confirmChanges}
				onClose={() => setConfirmChanges(false)}
				onConfirm={() => {
					setConfirmChanges(false);
					send();
				}}
				title="Талентийн өмнөх мэдээлэл шинэчлэгдсэн байна."
				description="Өөрчлөлтийг хадгалах уу?"
				confirmLabel="Урилга илгээх"
				pendingLabel="Илгээж байна..."
				loading={invite.isPending}
				danger={false}
				confirmIcon={<SendIcon />}
			/>
		</>
	);
}
