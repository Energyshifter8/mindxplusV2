"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/** Client дээр (hydration-ий дараа) true. Staging-ийн "mount болсны дараа render" загварт. */
export function useIsClient(): boolean {
	return useSyncExternalStore(
		noopSubscribe,
		() => true,
		() => false,
	);
}

/**
 * Staging layout: `window.innerWidth <= 767`-ийг mount үед НЭГ удаа тооцдог
 * (resize-ийг сонсдоггүй) — ижил зан төлөв.
 */
let mobileAtMount: boolean | undefined;
export function useIsMobileAtMount(): boolean {
	return useSyncExternalStore(
		noopSubscribe,
		() => {
			if (mobileAtMount === undefined) mobileAtMount = window.innerWidth <= 767;
			return mobileAtMount;
		},
		() => false,
	);
}
