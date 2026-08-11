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
	const contentType = request.headers.get("content-type");
	if (contentType) headers.set("Content-Type", contentType);
	const authorization = request.headers.get("authorization");
	if (authorization) headers.set("Authorization", authorization);

	console.warn(`[proxy-debug] Incoming request: ${request.method} ${request.nextUrl.pathname}`);
	console.warn(`[proxy-debug] Authorization header received: ${authorization || "(none)"}`);
	console.warn(`[proxy-debug] Forwarding to: ${targetUrl}`);
	console.warn(`[proxy-debug] Forwarding Authorization: ${authorization || "(none)"}`);

	let body: string | undefined;
	if (method !== "GET" && method !== "HEAD") {
		body = await request.text();
	}

	const targetResponse = await fetch(targetUrl, {
		method,
		headers,
		body,
	});

	const responseHeaders = new Headers();
	const respContentType = targetResponse.headers.get("content-type");
	if (respContentType) responseHeaders.set("Content-Type", respContentType);

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
