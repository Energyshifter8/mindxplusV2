"use client";

import { Select } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Staging shadcn/radix Select (📦 module 50745)-ийн харагдал, base-ui Select дээр.

export interface RaSelectOption<V extends string> {
	value: V;
	label: React.ReactNode;
}

export function RaSelect<V extends string>({
	value,
	onChange,
	options,
	ariaLabel,
	triggerClassName,
	popupClassName,
	placeholder,
	disabled,
}: {
	value: V | null;
	onChange: (value: V) => void;
	options: readonly RaSelectOption<V>[];
	ariaLabel: string;
	triggerClassName?: string;
	popupClassName?: string;
	placeholder?: string;
	disabled?: boolean;
}) {
	return (
		<Select.Root
			value={value}
			onValueChange={(next) => {
				if (next !== null) onChange(next as V);
			}}
			items={options.map((o) => ({ value: o.value, label: o.label }))}
			disabled={disabled}
		>
			<Select.Trigger
				aria-label={ariaLabel}
				className={cn(
					"flex h-9 w-full items-center justify-between gap-3 whitespace-nowrap rounded-md border border-TextColor-secondary bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Primary/40 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-TextColor-third",
					triggerClassName,
				)}
			>
				<Select.Value placeholder={placeholder} />
				<Select.Icon className="flex">
					<ChevronDown className="h-4 w-4 opacity-50" aria-hidden />
				</Select.Icon>
			</Select.Trigger>
			<Select.Portal>
				<Select.Positioner
					alignItemWithTrigger={false}
					sideOffset={4}
					className="z-[1050]"
				>
					<Select.Popup
						className={cn(
							"ra-scope relative max-h-[var(--available-height)] min-w-[var(--anchor-width)] overflow-y-auto overflow-x-hidden rounded-md border border-Stroke-600 bg-white p-1 text-TextColor-main shadow-md outline-none transition-[opacity,scale] duration-100 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
							popupClassName,
						)}
					>
						<Select.List>
							{options.map((o) => (
								<Select.Item
									key={o.value}
									value={o.value}
									className="relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none hover:bg-slate-100 data-[highlighted]:bg-slate-100 data-[selected]:bg-slate-100"
								>
									<Select.ItemText>{o.label}</Select.ItemText>
									<Select.ItemIndicator className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
										<Check className="h-4 w-4" aria-hidden />
									</Select.ItemIndicator>
								</Select.Item>
							))}
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	);
}
