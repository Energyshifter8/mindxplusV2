// Parity tool: fetch + XMLHttpRequest-ийг patch хийж хүсэлтийн мета өгөгдөл бүртгэнэ.
// Утга (token, cookie, хувийн мэдээлэл) хадгалахгүй: header-ийн НЭР, body/response-ийн
// БҮТЭЦ (түлхүүр + төрөл) л бүртгэнэ.
//
// Хэрэглээ (Chrome javascript tool):
//   <энэ файлын агуулга>
//   parityFrame("/home", 1440, 900)        // ижил origin-ий iframe, анхны ачааллыг ч барина
//   await parityWait(4000); parityNet()    // бүртгэл (path-аас /api угтвар хасагдсан)

(() => {
	const shape = (v, depth = 0) => {
		if (v === null) return "null";
		if (Array.isArray(v))
			return v.length ? [shape(v[0], depth + 1), v.length] : [];
		if (typeof v === "object") {
			if (depth > 1) return "object";
			return Object.fromEntries(
				Object.keys(v)
					.sort()
					.map((k) => [k, shape(v[k], depth + 1)]),
			);
		}
		return typeof v;
	};
	const bodyShape = (body) => {
		if (body == null) return null;
		if (typeof body === "string") {
			try {
				return shape(JSON.parse(body));
			} catch {
				return `string(${body.length})`;
			}
		}
		if (typeof FormData !== "undefined" && body instanceof FormData)
			return `FormData[${[...body.keys()].join(",")}]`;
		return typeof body;
	};
	const normPath = (url, origin) => {
		const u = new URL(url, origin);
		const path = u.pathname.replace(/^\/api(?=\/)/, "");
		return {
			host: u.host,
			path,
			query: [...u.searchParams.keys()]
				.sort()
				.map((k) => `${k}=${u.searchParams.get(k)}`)
				.join("&"),
		};
	};

	function installNetPatch(win) {
		if (win.__parityPatched) return;
		win.__parityPatched = true;
		win.__parityNet = win.__parityNet || [];
		const log = win.__parityNet;

		const origFetch = win.fetch;
		win.fetch = async function (input, init = {}, ...rest) {
			const req = input instanceof win.Request ? input : null;
			const url = req ? req.url : String(input);
			const method = (init.method || req?.method || "GET").toUpperCase();
			const hdrs = new win.Headers(init.headers || req?.headers || {});
			const entry = {
				via: "fetch",
				method,
				...normPath(url, win.location.origin),
				headers: [...hdrs.keys()].sort(),
				body: bodyShape(init.body),
				start: Math.round(win.performance.now()),
			};
			log.push(entry);
			try {
				const res = await origFetch.call(this, input, init, ...rest);
				entry.status = res.status;
				entry.end = Math.round(win.performance.now());
				const ct = res.headers.get("content-type") || "";
				entry.ct = ct.split(";")[0];
				if (ct.includes("json")) {
					res
						.clone()
						.json()
						.then((j) => {
							entry.res = shape(j);
						})
						.catch(() => {});
				}
				return res;
			} catch (e) {
				entry.error = String(e?.name || e);
				throw e;
			}
		};

		const XHR = win.XMLHttpRequest.prototype;
		const open = XHR.open,
			send = XHR.send,
			setH = XHR.setRequestHeader;
		XHR.open = function (method, url, ...rest) {
			this.__p = {
				via: "xhr",
				method: String(method).toUpperCase(),
				...normPath(url, win.location.origin),
				headers: [],
			};
			return open.call(this, method, url, ...rest);
		};
		XHR.setRequestHeader = function (name, value) {
			this.__p?.headers.push(String(name).toLowerCase());
			return setH.call(this, name, value);
		};
		XHR.send = function (body) {
			const p = this.__p;
			if (p) {
				p.headers.sort();
				p.body = bodyShape(body);
				p.start = Math.round(win.performance.now());
				log.push(p);
				this.addEventListener("loadend", () => {
					p.status = this.status;
					p.end = Math.round(win.performance.now());
					const ct = this.getResponseHeader("content-type") || "";
					p.ct = ct.split(";")[0];
					if (ct.includes("json")) {
						try {
							p.res = shape(
								typeof this.response === "string"
									? JSON.parse(this.response)
									: this.response,
							);
						} catch {}
					}
				});
			}
			return send.call(this, body);
		};
	}

	/** Ижил origin-ий iframe үүсгэж, шинэ window үүсмэгц patch хийнэ. */
	window.parityFrame = (src, width, height) => {
		document.getElementById("parity-frame")?.remove();
		const f = document.createElement("iframe");
		f.id = "parity-frame";
		f.style.cssText = `position:fixed;left:0;top:0;width:${width}px;height:${height}px;border:0;z-index:2147483647;background:#fff`;
		document.body.appendChild(f);
		// contentWindow нь navigation хооронд ИЖИЛ WindowProxy тул identity биш,
		// шинэ document-ын global дээрх тэмдгээр шалгана.
		const timer = setInterval(() => {
			try {
				const w = f.contentWindow;
				if (w && w.location.href !== "about:blank" && !w.__parityPatched)
					installNetPatch(w);
			} catch {}
		}, 0);
		f.addEventListener("load", () =>
			setTimeout(() => clearInterval(timer), 15000),
		);
		f.src = src;
		return `frame ${width}x${height} -> ${src}`;
	};
	window.parityWin = () =>
		document.getElementById("parity-frame")?.contentWindow || window;
	window.parityWait = (ms) => new Promise((r) => setTimeout(r, ms));
	window.parityNet = (clear = false) => {
		const w = window.parityWin();
		const out = (w.__parityNet || []).slice();
		if (clear) w.__parityNet = [];
		return out;
	};
	window.parityPatchSelf = () => installNetPatch(window);
	window.parityCloseFrame = () =>
		document.getElementById("parity-frame")?.remove();
})();
