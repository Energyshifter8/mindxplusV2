import assert from "node:assert/strict";
import { test } from "node:test";
import {
	ApiError,
	getErrorMessage,
	getFieldErrors,
	isRetryableError,
	normalizeErrorCode,
	toProblemDetail,
} from "../../lib/api-errors.ts";
import {
	canCloseRecruitment,
	canDeleteRecruitment,
	canExtendInvitation,
	canInviteToRecruitment,
	canRenameRecruitment,
	INVITATION_STATUS_LABELS,
	isRecruitmentEditable,
	isResultAvailable,
	opensWizard,
	RECRUITMENT_STATUS_LABELS,
} from "../../lib/constants/roleAssessment.ts";
import {
	fromApiPageNumber,
	parsePageParams,
	toApiPage,
} from "../../lib/pagination.ts";

const params = (q) => new URLSearchParams(q);

test("хуудаслалт: URL 1-ээс ↔ API 0-ээс", () => {
	assert.deepEqual(parsePageParams(params("page=3&size=20")), {
		page: 3,
		size: 20,
	});
	assert.deepEqual(parsePageParams(params("")), { page: 1, size: 10 });
	assert.deepEqual(parsePageParams(params("page=0&size=7")), {
		page: 1,
		size: 10,
	});
	assert.deepEqual(parsePageParams(params("page=abc")), { page: 1, size: 10 });
	assert.deepEqual(toApiPage({ page: 1, size: 10 }), { page: 0, size: 10 });
	assert.deepEqual(toApiPage({ page: 5, size: 50 }), { page: 4, size: 50 });
	assert.equal(fromApiPageNumber(0), 1);
});

test("ProblemDetail code normalize", () => {
	assert.equal(normalizeErrorCode("NOT_FOUND"), "not_found");
	assert.equal(normalizeErrorCode("plan-expired"), "plan_expired");
	assert.equal(normalizeErrorCode(" System Error "), "system_error");
	assert.equal(normalizeErrorCode(""), undefined);
	assert.equal(normalizeErrorCode(404), undefined);
});

test("code → Монгол мессеж, үл мэдэгдэх code → fallback", () => {
	assert.equal(
		getErrorMessage(new ApiError("x", { status: 404, code: "not_found" })),
		"Мэдээлэл олдсонгүй",
	);
	assert.equal(
		getErrorMessage({ status: 400, code: "PLAN_EXPIRED" }),
		"Таны багцын хугацаа дууссан байна",
	);
	assert.equal(
		getErrorMessage(
			new ApiError("x", { status: 409, code: "weird" }),
			"Fallback",
		),
		"Fallback",
	);
	assert.equal(
		getErrorMessage(new ApiError("Network Error")),
		"Сервертэй холбогдож чадсангүй. Интернэт холболтоо шалгана уу",
	);
	assert.equal(getErrorMessage(null), "Алдаа гарлаа. Дахин оролдоно уу");
});

test("ProblemDetail задлах, талбарын алдаа", () => {
	const problem = toProblemDetail({
		type: "t",
		title: "Bad Request",
		status: 400,
		detail: "d",
		code: "VALIDATION_EXCEPTION",
		errors: [{ field: "email", value: "Имэйл буруу" }, { bad: 1 }],
	});
	assert.equal(problem.code, "VALIDATION_EXCEPTION");
	assert.equal(problem.errors.length, 1);
	const error = new ApiError("x", { status: 400, problem });
	assert.deepEqual(getFieldErrors(error), { email: "Имэйл буруу" });
	assert.equal(toProblemDetail([1]), undefined);
});

test("retry: 4xx ба invalid_argument дахин оролдохгүй", () => {
	assert.equal(isRetryableError(new ApiError("x", { status: 404 })), false);
	assert.equal(isRetryableError(new ApiError("x", { status: 503 })), true);
	assert.equal(isRetryableError(new ApiError("x")), true);
	assert.equal(
		isRetryableError(new ApiError("x", { code: "invalid_argument" })),
		false,
	);
});

test("статус label (DRAFT/COMPLETED биш)", () => {
	assert.equal(RECRUITMENT_STATUS_LABELS.CREATED, "Үүссэн");
	assert.equal(RECRUITMENT_STATUS_LABELS.PUBLISHED, "Идэвхтэй");
	assert.equal(RECRUITMENT_STATUS_LABELS.CLOSED, "Хаагдсан");
	assert.equal("DRAFT" in RECRUITMENT_STATUS_LABELS, false);
	assert.equal(INVITATION_STATUS_LABELS.PENDING, "Уригдсан");
	assert.equal(INVITATION_STATUS_LABELS.EXPIRED, "Хугацаа дууссан");
});

test("статусаас хамаарах үйлдэл", () => {
	assert.equal(isRecruitmentEditable("CREATED"), true);
	assert.equal(isRecruitmentEditable("PUBLISHED"), false);
	assert.equal(opensWizard("CLOSED"), false);
	assert.equal(canRenameRecruitment("CREATED"), true);
	assert.equal(canDeleteRecruitment("PUBLISHED"), false);
	assert.equal(canInviteToRecruitment("PUBLISHED"), true);
	assert.equal(canInviteToRecruitment("CLOSED"), false);
	assert.equal(canCloseRecruitment("CREATED"), false);
	assert.equal(canExtendInvitation("EXPIRED"), true);
	assert.equal(canExtendInvitation("PENDING"), false);
	assert.equal(isResultAvailable("STARTED"), true);
	assert.equal(isResultAvailable("PENDING"), false);
});
