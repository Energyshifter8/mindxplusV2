"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon, ContactSupportIcon } from "@/components/icons/staging";

// Staging-ийн "Холбоо барих" widget (📦 bundle). Бусад товч
// `openContactSupport()`-оор нээж болно.
const OPEN_EVENT = "contact-support:open";

export function openContactSupport(): void {
	window.dispatchEvent(new Event(OPEN_EVENT));
}

export function ContactSupport() {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleOpen = () => setOpen(true);
		window.addEventListener(OPEN_EVENT, handleOpen);
		return () => window.removeEventListener(OPEN_EVENT, handleOpen);
	}, []);

	useEffect(() => {
		if (!open) return;
		const handleMouseDown = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleMouseDown);
		return () => document.removeEventListener("mousedown", handleMouseDown);
	}, [open]);

	return (
		<div
			ref={rootRef}
			className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
		>
			{open && (
				<div className="flex w-[400px] flex-col items-end gap-6 rounded-[28px] bg-white p-6 shadow-[0px_8px_40px_rgba(0,0,0,0.12)]">
					<div className="relative flex w-full flex-col items-start justify-center px-2 py-1">
						<p className="whitespace-nowrap font-semibold text-[20px] leading-6 text-TextColor-main">
							Холбоо барих
						</p>
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="absolute top-1/2 right-0 flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[#f3f4f6]"
							aria-label="Хаах"
						>
							<CloseIcon />
						</button>
					</div>
					<div className="flex w-full flex-col items-center justify-center gap-6 px-2 font-medium tracking-[0.2px]">
						<p className="w-full font-medium text-[16px] leading-5 text-TextColor-secondary">
							Танд тусламж хэрэгтэй бол бидэнтэй холбогдоорой.
							<br />
							Хэрэв та техникийн асуудалтай тулгарсан, үйлчилгээ ашиглах үед
							алдаа гарсан, эсвэл системтэй холбоотой хүндрэл үүссэн бол бидэнд
							дэлгэрэнгүй мэдээлэл илгээнэ үү.
						</p>
						<div className="flex w-full items-start gap-[10px]">
							<div className="flex flex-col items-start justify-center gap-[10px]">
								<p className="w-[58px] font-medium text-[16px] text-TextColor-secondary">
									Имэйл:
								</p>
								<p className="h-10 w-[58px] font-medium text-[16px] text-TextColor-secondary">
									Утас:
								</p>
								<p className="w-[58px] font-medium text-[16px] text-TextColor-secondary">
									Хаяг:
								</p>
							</div>
							<div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-[10px]">
								<a
									href="mailto:info@mindxplus.com"
									target="_blank"
									rel="noreferrer"
									className="block w-full cursor-pointer font-medium text-[16px] leading-5 text-TextColor-main hover:underline"
								>
									info@mindxplus.com
								</a>
								<p className="w-full font-medium text-[16px] leading-5 text-TextColor-main">
									+976 7507-1100 <br /> 10:00–17:00 (Даваа-Баасан)
								</p>
								<p className="w-full font-medium text-[16px] leading-5 text-TextColor-main">
									Улаанбаатар хот, БЗД, 25-р хороо, 13-р хороолол, Нар Зам
									гудамж, 154б байр 1с тоот
								</p>
							</div>
						</div>
					</div>
				</div>
			)}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#4b5563] shadow-[0px_0px_24px_0px_rgba(0,0,0,0.6)] transition-colors hover:bg-[#374151]"
				aria-label="Холбоо барих"
			>
				<ContactSupportIcon />
			</button>
		</div>
	);
}
