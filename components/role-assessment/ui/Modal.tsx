"use client";

import { Dialog } from "@base-ui/react/dialog";
import { CloseIcon } from "@/components/icons/role-assessment";
import { cn } from "@/lib/utils";
import { RaButton } from "./Button";

// Staging modal (📦 module 38288): antd Modal, footer/title/closeIcon false, padding 0,
// border-radius 16, дотор `p-6` — title мөр + X, content `mt-[10px]`, footer `mt-4`.
// antd анхдагч: top 100px, mask rgba(0,0,0,.45), shadow. a11y: base-ui Dialog
// (focus trap, Escape, aria-labelledby).

const ANTD_SHADOW =
	"shadow-[0_6px_16px_0_rgba(0,0,0,0.08),0_3px_6px_-4px_rgba(0,0,0,0.12),0_9px_28px_8px_rgba(0,0,0,0.05)]";

export interface RaModalProps {
	open: boolean;
	onClose: () => void;
	/** Анхдагч толгой (гарчиг + X). `header` өгвөл орлоно. */
	title?: React.ReactNode;
	header?: React.ReactNode;
	children?: React.ReactNode;
	footer?: React.ReactNode;
	width?: number;
	className?: string;
	/** Ачаалж/хадгалж байх үед гадуур дарж, Escape-ээр хаахгүй */
	dismissible?: boolean;
}

export function RaModal({
	open,
	onClose,
	title,
	header,
	children,
	footer,
	width = 400,
	className,
	dismissible = true,
}: RaModalProps) {
	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next && dismissible) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-[1000] bg-black/45 transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
				<Dialog.Popup
					style={{ width: `min(${width}px, calc(100vw - 32px))` }}
					className={cn(
						"ra-scope fixed top-[100px] left-1/2 z-[1000] max-h-[calc(100dvh-120px)] -translate-x-1/2 overflow-y-auto rounded-2xl bg-white outline-none transition-[scale,opacity] duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
						ANTD_SHADOW,
					)}
				>
					<div className={cn("relative flex w-full flex-col p-6", className)}>
						{header ?? (
							<div className="flex items-center justify-between">
								<Dialog.Title className="font-semibold text-TextColor-main text-base leading-5">
									{title}
								</Dialog.Title>
								<RaButton
									variant="ghost"
									prefixIcon={
										<CloseIcon className="!size-7 text-TextColor-main" />
									}
									onClick={onClose}
									ariaLabel="Хаах"
								/>
							</div>
						)}
						{children != null && <div className="mt-[10px]">{children}</div>}
						{footer != null && <div className="mt-4">{footer}</div>}
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/** `header` өгөхөд гарчгийг aria-д холбох */
export const RaModalTitle = Dialog.Title;

export interface RaConfirmDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: React.ReactNode;
	description: React.ReactNode;
	confirmLabel: string;
	pendingLabel?: string;
	cancelLabel?: string;
	loading?: boolean;
	/** Устгах/хаах: улаан товч (staging) */
	danger?: boolean;
	confirmIcon?: React.ReactNode;
	width?: number;
}

/** Staging-ийн баталгаажуулах modal (устгах 📦 D, хаах 📦 29184). */
export function RaConfirmDialog({
	open,
	onClose,
	onConfirm,
	title,
	description,
	confirmLabel,
	pendingLabel,
	cancelLabel = "Буцах",
	loading = false,
	danger = true,
	confirmIcon,
	width,
}: RaConfirmDialogProps) {
	return (
		<RaModal
			open={open}
			onClose={onClose}
			title={title}
			width={width}
			dismissible={!loading}
			footer={
				<div className="flex items-center justify-end gap-2">
					<RaButton
						variant="outline"
						title={cancelLabel}
						size="small"
						onClick={onClose}
						disabled={loading}
					/>
					<RaButton
						title={loading && pendingLabel ? pendingLabel : confirmLabel}
						size="small"
						className={
							danger
								? "!bg-Semantic-error100 !text-Semantic-error500 hover:!bg-Semantic-error100/60"
								: undefined
						}
						onClick={onConfirm}
						disabled={loading}
						suffixIcon={confirmIcon}
					/>
				</div>
			}
		>
			<Dialog.Description className="font-normal text-[16px] text-TextColor-secondary leading-[1.4] tracking-[0.2px]">
				{description}
			</Dialog.Description>
		</RaModal>
	);
}
