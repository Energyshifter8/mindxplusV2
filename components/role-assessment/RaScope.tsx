import { cn } from "@/lib/utils";

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
		>
			{children}
		</div>
	);
}
