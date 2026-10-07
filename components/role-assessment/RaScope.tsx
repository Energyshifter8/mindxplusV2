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
			className="sticky top-0 z-[60] flex items-center justify-center gap-2 border-Semantic-warning500 border-b bg-Semantic-warning100 px-4 py-2 text-center font-semibold text-[14px] text-Semantic-warning800 leading-5"
		>
			<span className="rounded bg-Semantic-warning500 px-1.5 py-0.5 font-bold text-[12px]">
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
		<div className={cn("ra-scope flex min-h-full flex-col", className)}>
			<DryRunBanner />
			{children}
		</div>
	);
}
