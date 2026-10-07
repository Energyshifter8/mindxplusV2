// Цэвэр функцүүдийн unit тест: `pnpm test` (node --test, Node ≥ 22.6 type stripping).
process.env.TZ = "Asia/Ulaanbaatar";

import assert from "node:assert/strict";
import { test } from "node:test";
import {
	formatDateBullet,
	formatPersonShort,
	formatRelative,
	formatStatCount,
	formatYmd,
	isCyrillicName,
	keepCyrillic,
	minutesRangeOrDash,
	splitDateTime,
} from "../../lib/format.ts";

test("formatDateBullet: staging r6", () => {
	assert.equal(
		formatDateBullet("2026-10-06T11:17:37.493+08:00"),
		"2026-10-06 • 11:17",
	);
	assert.equal(formatDateBullet("2026-10-06T00:00:00+08:00"), "2026-10-06");
	assert.equal(formatDateBullet("2026-10-06"), "2026-10-06");
	assert.equal(formatDateBullet(null), "---");
	assert.equal(formatDateBullet("буруу"), "---");
});

test("splitDateTime: ISO мөрөөс хөрвүүлэлгүй", () => {
	assert.deepEqual(splitDateTime("2026-10-06T23:59:10.1+08:00"), {
		date: "2026-10-06",
		time: "23:59",
	});
	assert.deepEqual(splitDateTime("2026-10-06"), {
		date: "2026-10-06",
		time: "",
	});
	assert.deepEqual(splitDateTime(""), { date: "-", time: "" });
	assert.deepEqual(splitDateTime(null), { date: "-", time: "" });
});

test("formatYmd", () => {
	assert.equal(formatYmd("2026-10-06T09:05:00+08:00"), "2026-10-06");
	assert.equal(
		formatYmd("2026-10-06T09:05:00+08:00", true),
		"2026-10-06 09:05",
	);
	assert.equal(formatYmd("x"), "");
});

test("formatRelative: staging-ийн шатлал", () => {
	const now = Date.parse("2026-10-07T12:00:00+08:00");
	assert.equal(
		formatRelative("2026-10-07T11:55:00+08:00", now),
		"5 минутын өмнө",
	);
	assert.equal(
		formatRelative("2026-10-07T09:00:00+08:00", now),
		"3 цагийн өмнө",
	);
	assert.equal(formatRelative("2026-10-06T10:00:00+08:00", now), "Өдрийн өмнө");
	assert.equal(
		formatRelative("2026-10-01T12:00:00+08:00", now),
		"6 өдрийн өмнө",
	);
	assert.equal(
		formatRelative("2026-10-08T12:00:00+08:00", now),
		"0 минутын өмнө",
	);
	assert.equal(formatRelative(undefined, now), "-");
});

test("formatStatCount: ≥10000 → Хязгааргүй, null → 0", () => {
	assert.equal(formatStatCount(100408), "Хязгааргүй");
	assert.equal(formatStatCount(10000), "Хязгааргүй");
	assert.equal(formatStatCount(9999), "9999");
	assert.equal(formatStatCount(null), "0");
	assert.equal(formatStatCount(undefined), "0");
});

test("formatPersonShort: staging E6", () => {
	assert.equal(
		formatPersonShort({ firstName: "Дорж", lastName: "жаргал" }),
		"Ж. Дорж",
	);
	assert.equal(formatPersonShort({ firstName: "Дорж", lastName: "" }), "Дорж");
	assert.equal(formatPersonShort(null), "");
});

test("кирилл нэрийн шүүлтүүр", () => {
	assert.equal(keepCyrillic("Бат-Эрдэнэ 1a"), "Бат-Эрдэнэ ");
	assert.equal(isCyrillicName(" Бат "), true);
	assert.equal(isCyrillicName("Bat"), false);
	assert.equal(isCyrillicName("  "), false);
});

test("dashboard хугацаа (staging module 34795)", () => {
	assert.equal(minutesRangeOrDash(15, 20), "15-20 Мин");
	assert.equal(minutesRangeOrDash(0, 8), "8 Мин");
	assert.equal(minutesRangeOrDash(5, 0), "5 Мин");
	assert.equal(minutesRangeOrDash(0, 0), "---");
	assert.equal(minutesRangeOrDash(null, undefined), "---");
	assert.equal(minutesRangeOrDash(26, 33, "мин"), "26-33 мин");
});
