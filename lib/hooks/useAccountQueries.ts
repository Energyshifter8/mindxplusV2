"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchAccount, fetchProfile } from "@/lib/api";
import type { AccountDTO } from "@/lib/types/api";

const ACCOUNT_STORAGE_KEY = "accountInfo";

/** Staging (📦): queryKey ["profile"], retry: false, refetchOnWindowFocus: false, staleTime 5 мин */
export function useProfile() {
	return useQuery({
		queryKey: ["profile"],
		queryFn: fetchProfile,
		retry: false,
		refetchOnWindowFocus: false,
		staleTime: 300_000,
	});
}

function readStoredAccount(): AccountDTO | undefined {
	const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
	if (!raw || raw === "undefined") return undefined;
	try {
		return JSON.parse(raw) as AccountDTO;
	} catch {
		return undefined;
	}
}

/**
 * Staging sidebar (📦): localStorage "accountInfo"-г уншина; байхгүй бол
 * GET /customer/account (queryKey ["account"], retry: false) татаж хадгална.
 * Зөвхөн client дээр render хийгддэг component-оос дуудна (localStorage).
 */
export function useAccountInfo(): AccountDTO | undefined {
	const [stored] = useState(readStoredAccount);
	const { data } = useQuery({
		queryKey: ["account"],
		queryFn: fetchAccount,
		retry: false,
		enabled: !stored,
	});

	useEffect(() => {
		if (data) localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(data));
	}, [data]);

	return stored ?? data;
}

/** Staging: dueDate хүртэл үлдсэн бүтэн хоног (өнөөдрийн 00:00-оос). */
export function daysUntil(dueDate: string | undefined): number {
	if (!dueDate) return 0;
	const due = new Date(dueDate);
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
	return Math.ceil((dueDay.getTime() - today.getTime()) / 86_400_000);
}
