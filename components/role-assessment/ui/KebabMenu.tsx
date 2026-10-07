"use client";

import { Menu } from "@base-ui/react/menu";
import { EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// Staging "⋮" цэс (📦 module 98935) — base-ui Menu (keyboard, role=menu).

export interface RaMenuAction {
	key: string;
	label: string;
	icon: React.ReactNode;
	onSelect: () => void;
	variant?: "danger";
	disabled?: boolean;
}

export function RaKebabMenu({
	actions,
	triggerClassName = "size-6",
	label = "Цэс",
}: {
	actions: RaMenuAction[];
	triggerClassName?: string;
	label?: string;
}) {
	if (actions.length === 0) return null;
	return (
		<Menu.Root>
			<Menu.Trigger
				aria-label={label}
				className={cn(
					"flex shrink-0 items-center justify-center rounded-lg text-TextColor-secondary transition-colors hover:bg-Gray-100 hover:text-TextColor-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40 data-[popup-open]:bg-Gray-100",
					triggerClassName,
				)}
			>
				<EllipsisVertical className="size-6" strokeWidth={1.75} aria-hidden />
			</Menu.Trigger>
			<Menu.Portal>
				<Menu.Positioner align="end" sideOffset={8} className="z-[1040]">
					<Menu.Popup className="ra-scope flex w-auto min-w-[200px] flex-col rounded-lg border border-Gray-50 bg-white p-[5px] shadow-[0_4px_6px_0_rgba(0,0,0,0.09)] outline-none transition-[opacity,scale] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
						{actions.map((a) => (
							<Menu.Item
								key={a.key}
								disabled={a.disabled}
								onClick={a.onSelect}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left font-medium text-sm outline-none transition-colors hover:bg-Gray-50 data-[highlighted]:bg-Gray-50 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
									a.variant === "danger"
										? "text-Semantic-error500 hover:text-Semantic-error500"
										: "text-TextColor-main",
								)}
							>
								<span
									className={cn(
										"flex size-4 shrink-0 items-center justify-center [&_svg]:size-4",
										a.variant === "danger"
											? "text-Semantic-error500"
											: "text-TextColor-main",
									)}
								>
									{a.icon}
								</span>
								{a.label}
							</Menu.Item>
						))}
					</Menu.Popup>
				</Menu.Positioner>
			</Menu.Portal>
		</Menu.Root>
	);
}
