process.env.TZ = "Asia/Ulaanbaatar";

import assert from "node:assert/strict";
import { test } from "node:test";
import {
	clampPage,
	splitLocalDateTime,
	talentDisplayName,
	toTalentCard,
	visibleTags,
} from "../../lib/role-assessment/talents.ts";

test("талентын карт (staging L mapper)", () => {
	const card = toTalentCard({
		id: 12,
		firstName: " Бат ",
		lastName: "Дорж",
		email: "a@b.mn",
		phoneNumber: null,
		avgStarPoint: 4.5,
		marked: true,
		createdAt: "2026-05-20T16:04:00+08:00",
		recruitments: [
			{ id: "r1", name: "Fullstack" },
			{ id: "r2", name: "Fullstack" },
			{ id: "r3", name: " " },
		],
	});
	assert.equal(card.talentId, "12");
	assert.equal(card.displayName, "Дорж Бат");
	assert.equal(card.phone, "");
	assert.equal(card.rating, 4.5);
	assert.equal(card.marked, true);
	assert.deepEqual(card.roles, ["Fullstack"]);
	assert.equal(toTalentCard({ id: 1, avgStarPoint: -1 }).rating, 0);
	assert.equal(toTalentCard({ id: 1 }).rating, null);
	assert.equal(talentDisplayName({}), "—");
});

test("tag, огноо, хуудас", () => {
	assert.deepEqual(visibleTags(["a", "b", "c", "d"]), {
		shown: ["a", "b"],
		more: 2,
	});
	assert.deepEqual(visibleTags(["a"]), { shown: ["a"], more: 0 });
	assert.deepEqual(splitLocalDateTime("2026-05-20T16:04:00+08:00"), {
		date: "2026-05-20",
		time: "16:04",
	});
	assert.deepEqual(splitLocalDateTime("2026-05-20T00:00:00+08:00"), {
		date: "2026-05-20",
		time: "",
	});
	assert.deepEqual(splitLocalDateTime("x"), { date: "—", time: "" });
	assert.deepEqual(splitLocalDateTime(null), { date: "—", time: "" });
	assert.equal(clampPage(5, 3), 3);
	assert.equal(clampPage(0, 3), 1);
	assert.equal(clampPage(2, 0), 1);
});
