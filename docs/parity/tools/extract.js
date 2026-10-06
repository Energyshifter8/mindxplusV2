// Parity tool: харагдаж буй node бүрийг дарааллаар нь {tag, role, text, rect, style}
// болгон гаргаж, хоёр апп-ын үр дүнг ТЕКСТЭЭР тааруулж diff хийнэ (class нэр өөр тул).
//
// Хувийн мэдээлэл: имэйл, нэвтэрсэн хэрэглэгчийн нэр, <tbody> доторх (талентын нэр г.м.)
// текстийг hash болгоно — тааруулахад хангалттай, утга нь гарахгүй.
//
// Хэрэглээ (Chrome javascript tool, ижил origin-ий iframe дотор):
//   <энэ файлын агуулга>
//   const a = parityExtract(parityWin().document, { root: "aside" })
//   parityDiff(stagingJson, a)   // нөгөө tab-аас авсан JSON-тэй харьцуулна

(() => {
	const STYLE_KEYS = {
		ff: "fontFamily",
		fs: "fontSize",
		fw: "fontWeight",
		lh: "lineHeight",
		ls: "letterSpacing",
		c: "color",
		bg: "backgroundColor",
		r: "borderRadius",
		sh: "boxShadow",
		p: "padding",
		m: "margin",
		gap: "gap",
		op: "opacity",
		cur: "cursor",
		tt: "textTransform",
		ta: "textAlign",
	};
	const INTERACTIVE = new Set([
		"A",
		"BUTTON",
		"INPUT",
		"SELECT",
		"TEXTAREA",
		"SUMMARY",
	]);

	const hash = (s) => {
		let h = 5381;
		for (const ch of s) h = ((h * 33) ^ ch.codePointAt(0)) >>> 0;
		return `#${h.toString(36)}:${s.length}`;
	};
	const collapse = (s) => s.replace(/\s+/g, " ").trim();

	function piiStrings(win) {
		const out = [];
		try {
			const p = JSON.parse(win.localStorage.getItem("userProfile") || "null");
			for (const k of [
				"firstName",
				"lastName",
				"email",
				"phoneNumber",
				"mobileNo",
			])
				if (p?.[k]) out.push(String(p[k]));
		} catch {}
		return out.filter((s) => s.length > 1);
	}

	function maskText(el, text, pii) {
		if (!text) return text;
		if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(text)) return hash(text);
		if (pii.some((s) => text.includes(s))) return hash(text);
		if (el.closest("tbody, [data-parity-pii]")) return hash(text);
		return text;
	}

	function border(cs) {
		const side = (s) => {
			const w = cs[`border${s}Width`];
			if (w === "0px" || cs[`border${s}Style`] === "none") return "none";
			return `${w} ${cs[`border${s}Style`]} ${cs[`border${s}Color`]}`;
		};
		const sides = ["Top", "Right", "Bottom", "Left"].map(side);
		return sides.every((s) => s === sides[0]) ? sides[0] : sides.join(" | ");
	}

	const isTransparent = (c) => c === "rgba(0, 0, 0, 0)" || c === "transparent";

	window.parityExtract = (doc, opts = {}) => {
		const win = doc.defaultView;
		const root =
			typeof opts.root === "string"
				? doc.querySelector(opts.root)
				: opts.root || doc.body;
		if (!root) return { error: `root not found: ${opts.root}` };
		const pii = piiStrings(win);
		const nodes = [];
		const walk = (el) => {
			const cs = win.getComputedStyle(el);
			if (cs.display === "none" || cs.visibility === "hidden") return;
			const rect = el.getBoundingClientRect();
			const visible = rect.width > 0 && rect.height > 0;
			const ownText = collapse(
				[...el.childNodes]
					.filter((n) => n.nodeType === 3)
					.map((n) => n.textContent)
					.join(" "),
			);
			const tag = el.tagName;
			const isSvg = tag.toLowerCase() === "svg";
			const box =
				!isTransparent(cs.backgroundColor) ||
				border(cs) !== "none" ||
				cs.boxShadow !== "none";
			if (
				visible &&
				(ownText || isSvg || tag === "IMG" || INTERACTIVE.has(tag) || box)
			) {
				const n = {
					tag: tag.toLowerCase(),
					role: el.getAttribute("role") || undefined,
					text: maskText(el, ownText, pii) || undefined,
					aria: el.getAttribute("aria-label")
						? maskText(el, el.getAttribute("aria-label"), pii)
						: undefined,
					x: Math.round(rect.left + win.scrollX),
					y: Math.round(rect.top + win.scrollY),
					w: Math.round(rect.width),
					h: Math.round(rect.height),
					bd: border(cs),
				};
				for (const [k, prop] of Object.entries(STYLE_KEYS))
					n[k] =
						k === "ff"
							? cs[prop].split(",")[0].replace(/["']/g, "").trim()
							: cs[prop];
				if (tag === "A") n.href = el.getAttribute("href");
				if (el.disabled) n.disabled = true;
				nodes.push(n);
			}
			if (isSvg) return;
			for (const child of el.children) walk(child);
		};
		walk(root);
		return nodes;
	};

	/** Текстээр (дарааллаар) тааруулж зөрүүг гаргана. tol: rect-ийн зөвшөөрөх зөрүү (px). */
	window.parityDiff = (
		staging,
		local,
		{ tol = 1, keys = Object.keys(STYLE_KEYS).concat(["bd"]) } = {},
	) => {
		const keyOf = (n) =>
			n.text ? `t:${n.text}` : n.aria ? `a:${n.aria}` : null;
		const index = (arr) => {
			const m = new Map();
			for (const n of arr) {
				const k = keyOf(n);
				if (!k) continue;
				if (!m.has(k)) m.set(k, []);
				m.get(k).push(n);
			}
			return m;
		};
		const S = index(staging),
			L = index(local);
		const missing = [],
			extra = [],
			diffs = [];
		for (const [k, sArr] of S) {
			const lArr = L.get(k) || [];
			sArr.forEach((s, i) => {
				const l = lArr[i];
				if (!l) {
					missing.push({ key: k, tag: s.tag, x: s.x, y: s.y });
					return;
				}
				const d = {};
				for (const p of keys) if (s[p] !== l[p]) d[p] = [s[p], l[p]];
				for (const p of ["x", "y", "w", "h"])
					if (Math.abs(s[p] - l[p]) > tol) d[p] = [s[p], l[p]];
				if (s.tag !== l.tag) d.tag = [s.tag, l.tag];
				if (Object.keys(d).length) diffs.push({ key: k, d });
			});
		}
		for (const [k, lArr] of L) {
			const sArr = S.get(k) || [];
			for (const l of lArr.slice(sArr.length))
				extra.push({ key: k, tag: l.tag, x: l.x, y: l.y });
		}
		const count = (arr) => {
			const acc = {};
			for (const n of arr) acc[n.tag] = (acc[n.tag] || 0) + 1;
			return acc;
		};
		return {
			counts: { staging: staging.length, local: local.length },
			tags: { staging: count(staging), local: count(local) },
			missing,
			extra,
			diffs,
		};
	};
})();
