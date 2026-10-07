"use client";

import { Dialog } from "@base-ui/react/dialog";
import { useMemo } from "react";
import { CloseIcon } from "@/components/icons/role-assessment";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { getErrorMessage } from "@/lib/api-errors";
import { useRoleAssessmentTest } from "@/lib/hooks/role-assessment/queries";
import { buildContentDoc } from "@/lib/role-assessment/html";
import { cn } from "@/lib/utils";

// Staging тестийн дэлгэрэнгүй drawer (📦 module 29241): antd Drawer 600px, толгой
// (нэр + X), контент, хөл ("Хаах" + footerExtra). GET /customer/role-assessments/tests/{id}
// зөвхөн нээгдсэн үед. Контентыг staging `dangerouslySetInnerHTML`-ийн оронд
// `<iframe sandbox="" srcDoc>`-д харуулна (D3).

const ANTD_DRAWER_SHADOW =
	"shadow-[-6px_0_16px_0_rgba(0,0,0,0.08),-3px_0_6px_-4px_rgba(0,0,0,0.12),-9px_0_28px_8px_rgba(0,0,0,0.05)]";

export function TestDetailDrawer({
	testId,
	onClose,
	footerExtra,
}: {
	testId: string | null;
	onClose: () => void;
	footerExtra?: React.ReactNode;
}) {
	const open = testId !== null;
	const query = useRoleAssessmentTest(open ? testId : undefined);
	const test = query.data;
	const content = test?.content;
	const srcDoc = useMemo(
		() => (content ? buildContentDoc(content) : ""),
		[content],
	);
	const title = test?.name || "Тестийн дэлгэрэнгүй";

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
					style={{ width: "min(600px, 100vw)" }}
					className={cn(
						"ra-scope fixed inset-y-0 right-0 z-[1000] flex flex-col bg-white outline-none transition-transform duration-300 ease-out data-ending-style:translate-x-full data-starting-style:translate-x-full",
						ANTD_DRAWER_SHADOW,
					)}
				>
					{query.isPending ? (
						<div
							className="flex items-center justify-center py-20"
							aria-busy="true"
						>
							<Dialog.Title className="sr-only">
								Тестийн дэлгэрэнгүй
							</Dialog.Title>
							<p className="text-[16px] text-TextColor-third">
								Ачааллаж байна...
							</p>
						</div>
					) : query.isError || !test ? (
						<div
							role="alert"
							className="flex flex-col items-center gap-3 py-20"
						>
							<Dialog.Title className="text-[16px] text-TextColor-third">
								{query.isError
									? getErrorMessage(query.error, "Мэдээлэл олдсонгүй")
									: "Мэдээлэл олдсонгүй"}
							</Dialog.Title>
							<RaButton variant="secondary" title="Хаах" onClick={onClose} />
						</div>
					) : (
						<div className="flex h-full flex-col">
							<div className="flex items-center justify-between border-Stroke-500 border-b p-6">
								<Dialog.Title className="font-semibold text-2xl text-TextColor-main leading-[140%]">
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
							<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
								{srcDoc ? (
									<iframe
										title={title}
										sandbox=""
										srcDoc={srcDoc}
										className="min-h-[400px] w-full flex-1 border-0 bg-white"
									/>
								) : (
									<div className="flex flex-1 items-center justify-center p-6">
										<p className="text-[14px] text-TextColor-third">
											Мэдээлэл байхгүй байна
										</p>
									</div>
								)}
							</div>
							<div className="flex items-center justify-end gap-3 border-Stroke-500 border-t p-6">
								<RaButton
									variant="secondary"
									title="Хаах"
									onClick={onClose}
									className="w-[95px]"
								/>
								{footerExtra}
							</div>
						</div>
					)}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
