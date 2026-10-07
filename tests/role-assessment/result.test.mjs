import assert from "node:assert/strict";
import { test } from "node:test";
import {
	canSubmitRating,
	formatEventSeconds,
	formatSpentTime,
	invitationDotClass,
	mergeNameOptions,
	nameOptionLabel,
	personFullName,
	proctoringRow,
} from "../../lib/role-assessment/result.ts";

test("зарцуулсан хугацаа (staging fo)", () => {
	assert.equal(formatSpentTime(null), "---");
	assert.equal(formatSpentTime({ minutes: 0, seconds: 1 }), "1 сек");
	assert.equal(formatSpentTime({ minutes: 5, seconds: 0 }), "5 мин");
	assert.equal(formatSpentTime({ minutes: 5, seconds: 3 }), "5 мин 3 сек");
	assert.equal(
		formatSpentTime({ minutes: 65, seconds: 3 }),
		"1 цаг 5 мин 3 сек",
	);
	assert.equal(formatSpentTime({ minutes: 0, seconds: 0 }), "---");
});

test("явцын хяналт (staging m, p)", () => {
	assert.equal(formatEventSeconds(37), "37сек");
	assert.equal(formatEventSeconds(125), "2мин 5сек");
	assert.equal(formatEventSeconds(-1), null);
	const def = {
		key: "PAGE_VISIBILITY_HIDDEN",
		fallbackKey: "TAB_SWITCH",
		hasDuration: true,
	};
	assert.deepEqual(
		proctoringRow({ TAB_SWITCH: { count: 1, seconds: 13 } }, def),
		{
			count: "1",
			duration: "13сек",
		},
	);
	assert.deepEqual(proctoringRow({}, def), { count: "-", duration: null });
	assert.deepEqual(
		proctoringRow({ COPY: { count: 0 } }, { key: "COPY", hasDuration: false }),
		{ count: "-", duration: null },
	);
	assert.deepEqual(
		proctoringRow(
			{ COPY: { count: 2, seconds: 9 } },
			{ key: "COPY", hasDuration: false },
		),
		{ count: "2", duration: null },
	);
});

test("нэрсийн жагсаалт (staging z)", () => {
	const current = {
		id: "c",
		firstName: "Б",
		lastName: "А",
		status: "COMPLETED",
	};
	assert.deepEqual(
		mergeNameOptions([{ id: "x" }], current).map((n) => n.id),
		["c", "x"],
	);
	assert.deepEqual(
		mergeNameOptions({ content: [{ id: "c" }] }, current).map((n) => n.id),
		["c"],
	);
	assert.deepEqual(mergeNameOptions(undefined, null), []);
	assert.equal(
		nameOptionLabel({ id: "1", lastName: "А", firstName: "Б" }),
		"А Б",
	);
	assert.equal(nameOptionLabel({ id: "1", email: "e" }), "e");
	assert.equal(personFullName({}), "---");
	assert.equal(invitationDotClass("STARTED"), "bg-Semantic-warning500");
	assert.equal(invitationDotClass("X"), "bg-Gray-300");
});

test("од үнэлгээ илгээх нөхцөл", () => {
	assert.equal(canSubmitRating(0, null, false), false);
	assert.equal(canSubmitRating(4, 4, false), false);
	assert.equal(canSubmitRating(4, 3, false), true);
	assert.equal(canSubmitRating(4, null, true), false);
});
