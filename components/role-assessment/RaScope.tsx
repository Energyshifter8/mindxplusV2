import { isRaDryRun } from "@/lib/api/role-assessment/dry-run";
import { cn } from "@/lib/utils";

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
				"ra-scope flex min-h-full min-w-0 flex-col [&>*]:w-full [&>*]:min-w-0",
				className,
			)}
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
