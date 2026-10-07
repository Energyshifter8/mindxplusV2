"use client";

import { Dialog } from "@base-ui/react/dialog";
import { CloseIcon } from "@/components/icons/role-assessment";
import { splitDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RaButton } from "./Button";

// Staging drawer (📦 module 33139): antd Drawer placement right, width 578,
// mask bg-black/10, body padding 0 → `flex flex-col gap-6 p-4 font-sf`.

const ANTD_DRAWER_SHADOW =
	"shadow-[-6px_0_16px_0_rgba(0,0,0,0.08),-3px_0_6px_-4px_rgba(0,0,0,0.12),-9px_0_28px_8px_rgba(0,0,0,0.05)]";

export function RaDrawer({
	open,
	onClose,
	title,
	statusTag,
	width = 578,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: React.ReactNode;
	statusTag?: React.ReactNode;
	width?: number;
	children: React.ReactNode;
}) {
	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Backdrop className="fixed inset-0 z-[1000] bg-black/10 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0" />
				<Dialog.Popup
					style={{ width: `min(${width}px, 100vw)` }}
					className={cn(
						"ra-scope fixed inset-y-0 right-0 z-[1000] overflow-y-auto bg-white outline-none transition-transform duration-300 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full",
						ANTD_DRAWER_SHADOW,
					)}
				>
					<div className="flex flex-col gap-6 p-4 font-sf">
						<div className="flex min-h-10 items-center justify-between gap-2">
							<div className="flex min-w-0 flex-wrap items-center gap-2">
								<Dialog.Title className="font-bold text-2xl text-TextColor-main leading-[1.4]">
									{title}
								</Dialog.Title>
								{statusTag}
							</div>
							<RaButton
								ariaLabel="Хаах"
								variant="ghost"
								onClick={onClose}
								prefixIcon={
									<CloseIcon className="!size-7 text-TextColor-main" />
								}
							/>
						</div>
						<div className="flex flex-col gap-4">{children}</div>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}

/** `JH`: гарчигтай хэсэг */
export function DrawerSection({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-2">
			<p className="font-medium text-TextColor-secondary text-sm leading-[1.4] tracking-[0.2px]">
				{label}
			</p>
			{children}
		</section>
	);
}

/** `_1`: хоосон тайлбар */
export function DrawerEmpty({ description }: { description: string }) {
	return (
		<div className="flex min-h-[180px] flex-col items-center justify-center gap-1 px-4 text-center">
			<p className="font-normal text-TextColor-third text-sm leading-[1.4] tracking-[0.2px]">
				{description}
			</p>
		</div>
	);
}

/** `qn`: хүрээтэй бүлэг */
export function DrawerCard({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-5 rounded-2xl border border-Stroke-700 p-4">
			{children}
		</div>
	);
}

/** `Qb`: label — утга мөр */
export function DrawerField({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-5 items-center justify-between gap-4">
			<p className="whitespace-nowrap font-medium text-TextColor-secondary text-base leading-5 tracking-[0.2px]">
				{label}
			</p>
			<div className="flex w-[200px] shrink-0 items-center">{children}</div>
		</div>
	);
}

/** `zi`: энгийн утга, хоосон бол "-" */
export function DrawerText({ value }: { value?: React.ReactNode }) {
	return (
		<span className="font-medium text-TextColor-main text-base leading-5 tracking-[0.2px]">
			{value || "-"}
		</span>
	);
}

/** `zX`: тод утга */
export function DrawerStrong({ value }: { value: React.ReactNode }) {
	return (
		<span className="font-bold text-TextColor-main text-base leading-5 tracking-[0.2px]">
			{value}
		</span>
	);
}

/** `cT`: огноо • цаг */
export function DrawerDate({ value }: { value?: string | null }) {
	const { date, time } = splitDateTime(value);
	if (!time) return <DrawerText value={date} />;
	return (
		<span className="flex items-center gap-2 whitespace-nowrap">
			<DrawerText value={date} />
			<span className="font-semibold text-TextColor-disable text-sm leading-[1.4]">
				•
			</span>
			<DrawerText value={time} />
		</span>
	);
}
