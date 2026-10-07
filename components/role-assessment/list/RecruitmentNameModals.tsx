"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CloseIcon } from "@/components/icons/role-assessment";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaModal, RaModalTitle } from "@/components/role-assessment/ui/Modal";
import { TextField } from "@/components/role-assessment/ui/TextField";
import { RECRUITMENT_NAME_MAX } from "@/lib/api/role-assessment";

// Staging үүсгэх (600px) ба нэр солих (600px) modal (📦 жагсаалтын хуудас).

export function CreateRecruitmentModal({
	open,
	onClose,
	onCreate,
	pending,
}: {
	open: boolean;
	onClose: () => void;
	onCreate: (name: string) => void;
	pending: boolean;
}) {
	const [name, setName] = useState("");
	const close = () => {
		setName("");
		onClose();
	};
	const submit = () => {
		if (!name.trim()) {
			toast.warning("Гарчиг оруулна уу");
			return;
		}
		onCreate(name);
	};
	return (
		<RaModal
			open={open}
			onClose={close}
			width={600}
			dismissible={!pending}
			header={
				<div className="flex items-center justify-between">
					<RaModalTitle className="font-semibold text-[20px] text-TextColor-main leading-6">
						Талентийн үнэлгээ үүсгэх
					</RaModalTitle>
					<RaButton
						variant="ghost"
						prefixIcon={<CloseIcon className="!size-7 text-TextColor-main" />}
						onClick={close}
						ariaLabel="Хаах"
					/>
				</div>
			}
			footer={
				<div className="flex items-center justify-end gap-3">
					<RaButton
						variant="outline"
						title="Хаах"
						onClick={close}
						disabled={pending}
					/>
					<RaButton
						variant="primary"
						title="Үүсгэх"
						onClick={submit}
						disabled={pending || !name.trim()}
						disabledReason={
							!name.trim() ? "Ажлын байрны нэр оруулна уу" : undefined
						}
					/>
				</div>
			}
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (!pending) submit();
				}}
			>
				<p className="mb-4 text-[16px] text-TextColor-secondary leading-[140%]">
					Ажлын байрны нэрээ оруулж, талент сонгон шалгаруулалтыг эхлүүлээрэй.
				</p>
				<TextField
					label="Ажлын байрны нэр"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder='Жишээ "Хүний нөөцийн менежер"'
					required
					maxLength={RECRUITMENT_NAME_MAX}
					autoFocus
				/>
			</form>
		</RaModal>
	);
}

export function RenameRecruitmentModal({
	target,
	onClose,
	onRename,
	pending,
}: {
	target: { id: string; name: string } | null;
	onClose: () => void;
	onRename: (vars: { id: string; name: string }) => void;
	pending: boolean;
}) {
	return (
		<RenameForm
			key={target?.id ?? "closed"}
			target={target}
			onClose={onClose}
			onRename={onRename}
			pending={pending}
		/>
	);
}

function RenameForm({
	target,
	onClose,
	onRename,
	pending,
}: {
	target: { id: string; name: string } | null;
	onClose: () => void;
	onRename: (vars: { id: string; name: string }) => void;
	pending: boolean;
}) {
	const [name, setName] = useState(target?.name ?? "");
	const submit = () => {
		if (target && name.trim()) onRename({ id: target.id, name: name.trim() });
	};
	return (
		<RaModal
			open={target !== null}
			onClose={onClose}
			width={600}
			dismissible={!pending}
			title="Сонгон шалгаруулалт нэр солих"
			footer={
				<div className="flex items-center justify-end gap-3">
					<RaButton
						variant="outline"
						title="Хаах"
						onClick={onClose}
						disabled={pending}
					/>
					<RaButton
						variant="primary"
						title={pending ? "Хадгалж байна..." : "Нэр өөрчлөх"}
						onClick={submit}
						disabled={pending || !name.trim()}
					/>
				</div>
			}
		>
			<form
				className="mt-5"
				onSubmit={(e) => {
					e.preventDefault();
					if (!pending) submit();
				}}
			>
				<TextField
					label="Ажлын байрны нэр"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Нэрээ оруулна уу"
					required
					maxLength={RECRUITMENT_NAME_MAX}
					autoFocus
				/>
			</form>
		</RaModal>
	);
}
