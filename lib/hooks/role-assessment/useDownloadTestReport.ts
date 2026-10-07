"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { downloadTestReport } from "@/lib/api/role-assessment";
import { getErrorMessage } from "@/lib/api-errors";
import { parseContentDispositionFilename, saveBlob } from "@/lib/download";

const FALLBACK_FILENAME = "report.pdf";

/** "Тайлан татах" (#20): PDF-ийг татаж browser-оор хадгална. */
export function useDownloadTestReport() {
	return useMutation({
		mutationFn: async (vars: { invitationId: string; answerId: string }) => {
			const { blob, contentDisposition } = await downloadTestReport(
				vars.invitationId,
				vars.answerId,
			);
			const filename =
				parseContentDispositionFilename(contentDisposition) ??
				FALLBACK_FILENAME;
			saveBlob(blob, filename);
			return filename;
		},
		onError: (error) => {
			toast.error(getErrorMessage(error, "Тайлан татахад алдаа гарлаа"));
		},
	});
}
