import { isRaDryRun } from "@/lib/api/role-assessment/dry-run";
import { cn } from "@/lib/utils";

/**
 * Бичих хүсэлт сүлжээнд гарахгүй үед (NEXT_PUBLIC_RA_ALLOW_WRITES ≠ "1") үргэлж харагдана
 * (docs/role-assessment/DECISIONS.md D4).
 */
export function DryRunBanner() {
	if (!isRaDryRun()) return null;
	return (
		<div
			role="status"
			className="sticky top-0 z-[60] flex h-[37px] shrink-0 items-center justify-center gap-2 border-Semantic-warning500 border-b bg-Semantic-warning100 px-4 text-center font-semibold text-[14px] text-Semantic-warning800 leading-5"
		>
			<span className="rounded bg-Semantic-warning500 px-1.5 py-0.5 font-bold text-[12px] leading-4">
				DRY-RUN
			</span>
			өөрчлөлт staging-д хадгалагдахгүй
		</div>
	);
}

/** Талентийн үнэлгээний хуудсуудын light/staging scope (shell dark байсан ч). */
export function RaScope({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				// Хуудасны root нь flex item: staging-ийн `mx-auto` flex-col-д stretch-ийг унтрааж
				// өргөнийг хүснэгтийн min-content (1100px) болгодог тул `w-full min-w-0` —
				// хүснэгт өөрийн overflow-auto дотроо гүйлгэгдэнэ
				"ra-scope flex min-h-full min-w-0 flex-col [&>*]:w-full [&>*]:min-w-0",
				className,
			)}
			// Sticky толгойнууд banner-ын (h-[37px]) доор байрлана
			style={
				{
					"--ra-banner-h": isRaDryRun() ? "37px" : "0px",
				} as React.CSSProperties
			}
		>
			<DryRunBanner />
			{children}
		</div>
	);
}
