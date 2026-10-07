import { type NextRequest, NextResponse } from "next/server";
import {
	containsDryRunId,
	isRaWriteRequest,
	raWritesAllowed,
} from "@/lib/api/role-assessment/dry-run";

const STAGING_API = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Талентийн үнэлгээний DRY-RUN-ий давхар хамгаалалт (docs/role-assessment/DECISIONS.md D4):
 * client-ийн adapter-ийг ямар нэг замаар тойрсон бичих хүсэлтийг backend руу дамжуулахгүй.
 */
function dryRunGuard(method: string, path: string): NextResponse | null {
	const blocked = containsDryRunId(path)
		? { status: 404, code: "not_found" }
		: !raWritesAllowed() && isRaWriteRequest(method, path)
			? { status: 403, code: "ra_dry_run_blocked" }
			: null;
	if (!blocked) return null;
	return NextResponse.json(
		{
			type: "about:blank",
			title: blocked.status === 404 ? "Not Found" : "Forbidden",
			status: blocked.status,
			detail: "DRY-RUN: хүсэлт staging руу дамжуулагдаагүй",
			instance: path,
			code: blocked.code,
		},
		{
			status: blocked.status,
			headers: { "Content-Type": "application/problem+json" },
		},
	);
}

async function proxyRequest(
	request: NextRequest,
	method: string,
	pathSegments: string[],
): Promise<NextResponse> {
	const targetPath = pathSegments.join("/");
	const guarded = dryRunGuard(method, `/${targetPath}`);
	if (guarded) return guarded;
	const hasTrailingSlash = request.nextUrl.pathname.endsWith("/");
	const search = request.nextUrl.search;
	const targetUrl = `${STAGING_API}/${targetPath}${hasTrailingSlash ? "/" : ""}${search}`;

	// Allowlist: browser-ийн host/origin/sec-* гэх мэт header-ийг backend руу
	// дамжуулахгүйн тулд шинэ Headers-ээс эхэлнэ.
	const headers = new Headers();
	const authorization = request.headers.get("authorization");
	if (authorization) headers.set("Authorization", authorization);
	const cookie = request.headers.get("cookie");
	if (cookie) headers.set("Cookie", cookie);
	const accept = request.headers.get("accept");
	if (accept) headers.set("Accept", accept);
	// Staging апп бүх хүсэлтэд mn-MN илгээдэг; үгүй бол ProblemDetail.detail нь
	// "validation.recruitmentNotFound" гэх мэт орчуулаагүй түлхүүр болж ирдэг.
	headers.set("Accept-Language", "mn-MN");

	const fetchInit: RequestInit = { method, headers };

	if (method !== "GET" && method !== "HEAD") {
		const contentType = request.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			try {
				const body = await request.json();
				const serialized = JSON.stringify(body);
				headers.set("Content-Type", "application/json");
				fetchInit.body = serialized;
			} catch {
				const bodyText = await request.text();
				if (bodyText) {
					headers.set("Content-Type", contentType);
					fetchInit.body = bodyText;
				}
			}
		} else {
			// multipart (лого upload г.м.) binary агуулдаг: text() UTF-8 болгож
			// эвддэг тул байтаар нь, boundary-тай Content-Type-тай нь дамжуулна.
			const bodyBytes = await request.arrayBuffer();
			if (bodyBytes.byteLength > 0) {
				if (contentType) headers.set("Content-Type", contentType);
				fetchInit.body = bodyBytes;
			}
		}
	}

	const targetResponse = await fetch(targetUrl, fetchInit);

	const responseHeaders = new Headers();
	const respContentType = targetResponse.headers.get("content-type");
	if (respContentType) responseHeaders.set("Content-Type", respContentType);
	// "Тайлан татах" (#20): файлын нэрийг Content-Disposition-оос уншина
	const contentDisposition = targetResponse.headers.get("content-disposition");
	if (contentDisposition)
		responseHeaders.set("Content-Disposition", contentDisposition);

	// Forward Set-Cookie headers from backend to browser
	const setCookies: string[] =
		targetResponse.headers.getSetCookie?.() ??
		(() => {
			const raw = targetResponse.headers.get("set-cookie");
			return raw ? [raw] : [];
		})();

	if (setCookies.length > 0) {
		const isLocalhost =
			request.nextUrl.hostname === "localhost" ||
			request.nextUrl.hostname === "127.0.0.1" ||
			request.nextUrl.hostname === "0.0.0.0";

		const resHeaders = new Headers(responseHeaders);

		for (const sc of setCookies) {
			let cleaned = sc;

			// 1. Backend-ээс ирсэн Path=/user эсвэл бусад хязгаарлагдмал Path-ийг Path=/ болгож өөрчилнө.
			// Ингэснээр браузер /api/... зам руу хүсэлт явуулахад cookie-гээ хавсаргаж явуулна.
			cleaned = cleaned.replace(/Path=\/[^;]*/gi, "Path=/");

			// 2. Localhost орчинд Secure болон Domain атрибутуудыг цэвэрлэнэ
			if (isLocalhost) {
				cleaned = cleaned.replace(/;\s*Secure/gi, "");
				cleaned = cleaned.replace(/;\s*Domain=[^;]*/gi, "");
			}

			resHeaders.append("Set-Cookie", cleaned);
		}

		return new NextResponse(targetResponse.body, {
			status: targetResponse.status,
			headers: resHeaders,
		});
	}

	return new NextResponse(targetResponse.body, {
		status: targetResponse.status,
		headers: responseHeaders,
	});
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	return proxyRequest(request, "GET", path);
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	return proxyRequest(request, "POST", path);
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	return proxyRequest(request, "PUT", path);
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	return proxyRequest(request, "DELETE", path);
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path } = await params;
	return proxyRequest(request, "PATCH", path);
}
