"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
	ChevronSelectorIcon,
	MenuAccountIcon,
	MenuLogoutIcon,
	UserCircleIcon,
} from "@/components/icons/staging";
import { logout } from "@/lib/auth";
import { useProfile } from "@/lib/hooks/useAccountQueries";
import { ROUTES } from "@/lib/routes";

/**
 * Staging-ийн хэрэглэгчийн цэс (antd Dropdown, 📦 bundle): дарахад нээгдэнэ;
 * "Миний бүртгэл" → /profile, "Гарах" → POST /user/logout → /login.
 * Profile ачаалагдаагүй бол юу ч харуулахгүй.
 */
export function UserMenu() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data: profile } = useProfile();
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleMouseDown = (e: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("keydown", handleKey);
		return () => {
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("keydown", handleKey);
		};
	}, [open]);

	if (!profile) return null;

	async function handleLogout() {
		setOpen(false);
		await logout(() => queryClient.clear());
		router.push(ROUTES.login);
	}

	return (
		<div className="flex flex-row items-center justify-between gap-1">
			<div ref={rootRef} className="relative w-full">
				<button
					type="button"
					aria-haspopup="menu"
					aria-expanded={open}
					onClick={() => setOpen((v) => !v)}
					className="flex w-full cursor-pointer items-center justify-between gap-[9px] text-left"
				>
					<div className="flex items-center gap-[9px]">
						<UserCircleIcon className="!size-6 shrink-0 cursor-pointer text-[#2C2C2C]" />
						<span>
							<p className="font-semibold text-[#071522] text-[13px] leading-[16px]">
								Миний бүртгэл
							</p>
							<p className="mt-[2px] font-medium text-[#757575] text-[13px] leading-[16px]">
								{profile.email}
							</p>
						</span>
					</div>
					<span className="text-[#757575] text-[13px]">
						<ChevronSelectorIcon className="h-6 w-6 text-[#2C2C2C]" />
					</span>
				</button>

				{open && (
					<div
						role="menu"
						className="absolute bottom-full left-0 z-50 mb-1 w-[240px] rounded-[10px] bg-[#FDFDFD] p-1 shadow-[0px_0px_8px_1px_#00000026]"
					>
						<button
							type="button"
							role="menuitem"
							onClick={() => {
								setOpen(false);
								router.push(ROUTES.profile);
							}}
							className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-[4px] px-3 text-left transition-colors hover:bg-[rgba(0,0,0,0.04)]"
						>
							<MenuAccountIcon />
							<p className="font-medium text-[#071522] text-[13px]">
								Миний бүртгэл
							</p>
						</button>
						<button
							type="button"
							role="menuitem"
							onClick={handleLogout}
							className="flex h-10 w-full cursor-pointer items-center gap-2 rounded-[4px] px-3 text-left transition-colors hover:bg-[rgba(0,0,0,0.04)]"
						>
							<MenuLogoutIcon className="text-[#071522]" />
							<p className="font-medium text-[#071522] text-[13px]">Гарах</p>
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
