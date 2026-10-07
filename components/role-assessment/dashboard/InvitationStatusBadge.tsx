import type { ReactNode } from "react";
import {
	InvitationCompletedIcon,
	InvitationExpiredIcon,
	InvitationPendingIcon,
	InvitationStartedIcon,
} from "@/components/icons/role-assessment";
import {
	INVITATION_STATUS_LABELS,
	isInvitationStatus,
} from "@/lib/constants/roleAssessment";
import { cn } from "@/lib/utils";

// Staging урилгын төлөвийн badge (📦 module 28396): дугуй хүрээ, icon + текст.

const TONE: Record<string, string> = {
	COMPLETED: "text-Semantic-success500",
	STARTED: "text-Primary",
	PENDING: "text-Semantic-warning500",
	EXPIRED: "text-Semantic-error500",
};

const ICON: Record<string, ReactNode> = {
	COMPLETED: <InvitationCompletedIcon />,
	STARTED: <InvitationStartedIcon />,
	PENDING: <InvitationPendingIcon />,
	EXPIRED: <InvitationExpiredIcon />,
};

export function InvitationStatusBadge({ status }: { status?: string | null }) {
	const known = isInvitationStatus(status);
	return (
		<div className="flex justify-start">
			<div
				className={cn(
					"flex items-center gap-1.5 rounded-full border border-Gray-300 px-3 py-1",
					known ? TONE[status] : "text-TextColor-third",
				)}
			>
				{known ? (
					ICON[status]
				) : (
					<svg
						aria-hidden="true"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
					>
						<circle cx="8" cy="8" r="8" fill="#D9D9D9" />
					</svg>
				)}
				<span className="whitespace-nowrap font-medium text-[14px] text-TextColor-main leading-[140%]">
					{known ? INVITATION_STATUS_LABELS[status] : status || "---"}
				</span>
			</div>
		</div>
	);
}
