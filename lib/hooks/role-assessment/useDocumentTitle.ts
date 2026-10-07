"use client";

import { useEffect } from "react";

/**
 * Staging (📦 module 28797/46075): `document.title`-ийг хуудас бүр тавина. Next-ийн
 * async metadata (root layout-ын "System") дараа нь дарж бичдэг тул `<head>`-ийг ажиглаж
 * mount байх хугацаанд гарчгийг хадгална.
 */
export function useDocumentTitle(title: string) {
	useEffect(() => {
		const wanted = title.trim();
		const apply = () => {
			if (document.title !== wanted) document.title = wanted;
		};
		apply();
		const observer = new MutationObserver(apply);
		observer.observe(document.head, {
			subtree: true,
			childList: true,
			characterData: true,
		});
		return () => observer.disconnect();
	}, [title]);
}

/** Staging-ийн хуудасны гарчиг (📦 module 27694 / 46075). */
export const RA_TITLES = {
	list: "Талентийн үнэлгээ",
	wizard: (step: string) => `Талентийн үнэлгээ - ${step}`,
	preview: "Талентийн үнэлгээ - Урьдчилан харах",
	dashboard: "Талентийн үнэлгээ",
	result: "Талентийн үнэлгээ - Дэлгэрэнгүй",
	talents: "Миний урьсан талентууд",
	talent: "Миний урьсан талентууд — Дэлгэрэнгүй",
} as const;
