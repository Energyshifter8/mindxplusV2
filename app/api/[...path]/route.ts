import { type NextRequest, NextResponse } from "next/server";

const STAGING_API = process.env.NEXT_PUBLIC_API_URL || "";

async function proxyRequest(
	request: NextRequest,
	method: string,
	pathSegments: string[],
): Promise<NextResponse> {
	const targetPath = pathSegments.join("/");
	const hasTrailingSlash = request.nextUrl.pathname.endsWith("/");
	const search = request.nextUrl.search;
	const targetUrl = `${STAGING_API}/${targetPath}${hasTrailingSlash ? "/" : ""}${search}`;

	const headers = new Headers();
	const authorization = request.headers.get("authorization");
	if (authorization) headers.set("Authorization", authorization);
	const cookie = request.headers.get("cookie");
	if (cookie) headers.set("Cookie", cookie);
	const accept = request.headers.get("accept");
	if (accept) headers.set("Accept", accept);
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
	const contentDisposition = targetResponse.headers.get("content-disposition");
	if (contentDisposition)
		responseHeaders.set("Content-Disposition", contentDisposition);

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

			cleaned = cleaned.replace(/Path=\/[^;]*/gi, "Path=/");

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
