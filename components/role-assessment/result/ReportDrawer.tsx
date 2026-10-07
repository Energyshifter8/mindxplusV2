"use client";

import { Dialog } from "@base-ui/react/dialog";
import { DownloadIcon } from "@/components/icons/role-assessment";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { cn } from "@/lib/utils";

// Staging тестийн HTML тайлангийн drawer (📦 module 1043 `H`): antd Drawer 700px,
// `p-5`, iframe + хөл ("Тайлан татах", "Хаах"). Staging `sandbox="allow-same-origin"`
// — бид `sandbox=""` (D3: script ч, апп-ын origin ч байхгүй). Серверийн HTML бүтэн
// баримт тул srcDoc-д шууд.

const ANTD_DRAWER_SHADOW =
	"shadow-[-6px_0_16px_0_rgba(0,0,0,0.08),-3px_0_6px_-4px_rgba(0,0,0,0.12),-9px_0_28px_8px_rgba(0,0,0,0.05)]";

export function ReportDrawer({
	open,
	onClose,
	html,
	title,
	canDownload,
	downloading,
	onDownload,
}: {
	open: boolean;
	onClose: () => void;
	/** null — тайлан олдсонгүй/алдаа */
	html: string | null;
	title: string | null;
	canDownload: boolean;
	downloading: boolean;
	onDownload: () => void;
}) {
	const frameTitle = title || "Тестийн дэлгэрэнгүй";
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
					style={{ width: "min(700px, 100vw)" }}
					className={cn(
						"ra-scope fixed inset-y-0 right-0 z-[1000] flex flex-col bg-white outline-none transition-transform duration-300 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full",
						ANTD_DRAWER_SHADOW,
					)}
				>
					<Dialog.Title className="sr-only">{frameTitle}</Dialog.Title>
					<div className="flex h-full flex-col p-5">
						<div className="min-h-0 flex-1">
							{html ? (
								<iframe
									srcDoc={html}
									title={frameTitle}
									sandbox=""
									className="h-full w-full border-0 bg-white"
									style={{ colorScheme: "light" }}
								/>
							) : (
								<div className="flex h-full items-center justify-center">
									<p className="text-[16px] text-TextColor-third">
										Мэдээлэл олдсонгүй
									</p>
								</div>
							)}
						</div>
						<div className="flex shrink-0 items-center justify-end gap-3 border-Stroke-500 border-t px-6 py-4">
							{canDownload && (
								<RaButton
									variant="primary"
									size="small"
									title={downloading ? "Татдаж байна..." : "Тайлан татах"}
									prefixIcon={
										downloading ? (
											<span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
										) : (
											<DownloadIcon />
										)
									}
									onClick={onDownload}
									disabled={downloading}
									className="w-auto"
								/>
							)}
							<RaButton
								variant="secondary"
								title="Хаах"
								onClick={onClose}
								className="w-[95px]"
							/>
						</div>
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
