"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { CloseIcon } from "@/components/icons/role-assessment";
import { RaButton } from "@/components/role-assessment/ui/Button";
import { RaModal, RaModalTitle } from "@/components/role-assessment/ui/Modal";

// Staging "Багцын хугацаа дууссан" modal (📦 module 13939): dashboard-ын detail
// GET `plan_expired` code-оор унавал нээгдэнэ. "Багцтай танилцах" → `/membership`
// (энэ аппад membership модуль байхгүй — mismatches.md).

export function PlanExpiredModal({
	open,
	onClose,
	message,
}: {
	open: boolean;
	onClose: () => void;
	message?: string;
}) {
	const router = useRouter();
	return (
		<RaModal
			open={open}
			onClose={onClose}
			width={480}
			bare
			className="rounded-[16px] p-0"
		>
			<div className="flex flex-col px-6 pt-5 pb-8">
				<div className="flex items-center justify-between">
					<RaModalTitle className="font-semibold text-TextColor-main text-lg leading-snug">
						Багцын хугацаа дууссан
					</RaModalTitle>
					<RaButton
						variant="ghost"
						prefixIcon={<CloseIcon className="!size-6 text-TextColor-main" />}
						onClick={onClose}
						ariaLabel="Хаах"
					/>
				</div>
				<div className="my-6 flex justify-center">
					<Image
						src="/images/role-assessment/plan-expired.svg"
						alt=""
						width={160}
						height={160}
					/>
				</div>
				<p className="text-center text-[20px] text-TextColor-secondary leading-6">
					{message || (
						<>
							Таны багцын хугацаа дууссан байна.
							<br />
							Та багцаа сунгана уу.
						</>
					)}
				</p>
				<div className="mt-6 flex justify-center">
					<RaButton
						variant="primary"
						title="Багцтай танилцах"
						onClick={() => {
							onClose();
							router.push("/membership");
						}}
					/>
				</div>
			</div>
		</RaModal>
	);
}
