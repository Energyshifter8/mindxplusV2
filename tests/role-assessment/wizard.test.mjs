import assert from "node:assert/strict";
import { test } from "node:test";
import {
	buildContentDoc,
	normalizeQuillHtml,
} from "../../lib/role-assessment/html.ts";
import {
	continueDisabled,
	durationLabel,
	isInfoComplete,
	isInfoDirty,
	isSelectionDirty,
	orderByIds,
	rightStepView,
	stepNavigation,
	sumDurations,
	toCategoryOptions,
	toggleSelection,
	topStepStatus,
	toWizardQuestion,
	toWizardTest,
	uniqueById,
	withQuestionTime,
} from "../../lib/role-assessment/wizard.ts";

const base = {
	step: 1,
	readOnly: false,
	isCreated: true,
	infoComplete: false,
	infoDirty: false,
	testsDirty: false,
	questionsDirty: false,
	selectedTestCount: 0,
	hasSelectedTestData: false,
	hasSelectedQuestionData: false,
	serverTestCount: 0,
	serverQuestionCount: 0,
};

test("мэдээлэл бүрэн/өөрчлөгдсөн (staging eR/eO)", () => {
	const info = {
		jobTitle: "A",
		jobDescription: "<p>x</p>",
		companyName: "C",
		companyDescription: null,
	};
	assert.equal(isInfoComplete(info), true);
	assert.equal(isInfoComplete({ ...info, jobDescription: null }), false);
	const form = {
		jobTitle: "A",
		jobDescription: "<p>x</p>",
		companyName: "C",
		companyDescription: "",
	};
	assert.equal(isInfoDirty(form, info), false);
	assert.equal(isInfoDirty({ ...form, jobTitle: " A " }), false);
	assert.equal(isInfoDirty({ ...form, companyName: "D" }, info), true);
	assert.equal(isInfoDirty(form, { ...info, companyName: "" }), false);
});

test("сонголт өөрчлөгдсөн (staging eJ/eX)", () => {
	assert.equal(isSelectionDirty(["a", "b"], ["b", "a"]), false);
	assert.equal(isSelectionDirty(["a"], ["a", "b"]), true);
	assert.equal(isSelectionDirty([], undefined), false);
	assert.equal(isSelectionDirty(["a"], []), true);
});

test("баруун самбарын шилжилт (staging Steps onChange)", () => {
	assert.deepEqual(stepNavigation(2, base), { kind: "stay" });
	assert.deepEqual(stepNavigation(2, { ...base, infoComplete: true }), {
		kind: "go",
		step: 2,
	});
	assert.deepEqual(
		stepNavigation(2, { ...base, infoComplete: true, infoDirty: true }),
		{
			kind: "stay",
		},
	);
	assert.deepEqual(
		stepNavigation(3, { ...base, step: 2, infoComplete: true }),
		{
			kind: "warn",
			message: "Тест сонгоно уу",
		},
	);
	assert.deepEqual(
		stepNavigation(1, { ...base, step: 3, infoComplete: true }),
		{
			kind: "go",
			step: 1,
		},
	);
	assert.deepEqual(stepNavigation(4, { ...base, readOnly: true }), {
		kind: "go",
		step: 4,
	});
});

test("алхмын харагдац", () => {
	assert.deepEqual(rightStepView(1, { ...base, infoComplete: true }), {
		status: "finish",
		badge: "done",
	});
	assert.deepEqual(rightStepView(1, base), {
		status: "process",
		badge: "doing",
	});
	assert.deepEqual(
		rightStepView(1, { ...base, infoComplete: true, infoDirty: true }),
		{
			status: "process",
			badge: "doing",
		},
	);
	assert.equal(rightStepView(3, { ...base, step: 2 }).status, "wait");
	assert.equal(topStepStatus(1, 3), "finish");
	assert.equal(topStepStatus(3, 3), "process");
	assert.equal(topStepStatus(4, 3), "wait");
});

test("Үргэлжлүүлэх disabled", () => {
	const s = {
		step: 1,
		readOnly: false,
		publishing: false,
		infoFilled: true,
		selectedTestCount: 0,
	};
	assert.equal(continueDisabled(s), false);
	assert.equal(continueDisabled({ ...s, infoFilled: false }), true);
	assert.equal(continueDisabled({ ...s, step: 2 }), true);
	assert.equal(continueDisabled({ ...s, step: 3 }), false);
	assert.equal(continueDisabled({ ...s, readOnly: true }), true);
});

test("хугацаа, хязгаар, дараалал", () => {
	assert.deepEqual(sumDurations(["15-20", "3-5", "8"]), { min: 26, max: 33 });
	assert.deepEqual(withQuestionTime({ min: 10, max: 20 }, 2), {
		min: 14,
		max: 30,
	});
	assert.equal(durationLabel(3, 5), "3-5");
	assert.equal(durationLabel(0, 0, "1-2"), "1-2");
	assert.deepEqual(toggleSelection(["a"], "b", 4), ["a", "b"]);
	assert.deepEqual(toggleSelection(["a", "b"], "a", 4), ["b"]);
	assert.equal(toggleSelection(["a", "b"], "c", 2), "limit");
	assert.deepEqual(orderByIds([2, 1], [{ id: 1 }, { id: 2 }, { id: 3 }]), [
		{ id: 2 },
		{ id: 1 },
	]);
	assert.deepEqual(
		uniqueById([
			{ id: 1, v: "a" },
			{ id: 1, v: "b" },
		]),
		[{ id: 1, v: "a" }],
	);
});

test("каталогийн хөрвүүлэлт", () => {
	const cats = toCategoryOptions([
		{ id: "hiring_soft_skill", name: "Зөөлөн ур чадвар" },
	]);
	assert.deepEqual(cats[0], { key: "", label: "Бүгд" });
	const t = toWizardTest(
		{
			id: "x",
			name: "Сэтгэлийн хат",
			category: "Зөөлөн ур чадвар",
			questionCount: 21,
			minMinutes: 5,
			maxMinutes: 8,
			color: "YELLOW",
		},
		cats,
	);
	assert.equal(t.category, "hiring_soft_skill");
	assert.equal(t.duration, "5-8");
	const q = toWizardQuestion(
		{ id: 9, content: "Асуулт", minMinutes: 0, maxMinutes: 0 },
		cats,
	);
	assert.equal(q.duration, "1-2");
});

test("HTML normalize (staging regex) ба srcDoc", () => {
	assert.equal(
		normalizeQuillHtml(
			'<p>a&nbsp;b</p><p><br></p><ol><li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>x</li></ol>',
		),
		'<p>a b</p><ul style="list-style-type:disc;padding-left:1.5rem;margin-bottom:0.75rem"><li>x</li></ul>',
	);
	assert.match(
		normalizeQuillHtml('<ol><li data-list="ordered">1</li></ol>'),
		/^<ol style="list-style-type:decimal/,
	);
	const doc = buildContentDoc("<p>t</p>");
	assert.match(doc, /^<!doctype html>/);
	assert.match(doc, /<body><p>t<\/p><\/body>/);
	assert.doesNotMatch(doc, /<script/i);
});
