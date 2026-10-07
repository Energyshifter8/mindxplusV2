import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
	buildDryRunResponse,
	formatDryRunLog,
	isDryRunId,
	isRaWriteRequest,
	makeDryRunId,
	maskForLog,
	requestPathOf,
	shouldDryRun,
} from "../../lib/api/role-assessment/dry-run.ts";

const FLAG = "NEXT_PUBLIC_RA_ALLOW_WRITES";
const original = process.env[FLAG];
afterEach(() => {
	if (original === undefined) delete process.env[FLAG];
	else process.env[FLAG] = original;
});

test("path: /api угтвар, query хасна", () => {
	assert.equal(
		requestPathOf("/customer/recruitments/?page=0"),
		"/customer/recruitments/",
	);
	assert.equal(requestPathOf("api/customer/x"), "/customer/x");
	assert.equal(requestPathOf(undefined), "/");
});

test("RA бичих хүсэлтийг таних", () => {
	const writes = [
		"/customer/recruitments/new",
		"/customer/recruitments/close",
		"/customer/recruitments/delete",
		"/customer/recruitments/9547a97a-342d-4db2-9b40-8e9ef400aee5/rename",
		"/customer/recruitment-setup/publish",
		"/customer/recruitment-setup/x/update-information",
		"/customer/role-assessments/recommend",
		"/customer/designs/RECRUITMENT/x/upload-logo",
		"/customer/hiring-invitations/invite",
		"/customer/hiring-invitations/search-by-email",
		"/customer/hiring-invitations/talents/bookmark",
	];
	for (const path of writes)
		assert.equal(isRaWriteRequest("POST", path), true, path);
	assert.equal(isRaWriteRequest("GET", "/customer/recruitments/new"), false);
	assert.equal(isRaWriteRequest("POST", "/customer/surveys/delete"), false);
	assert.equal(
		isRaWriteRequest("POST", "/customer/designs/survey/x/update"),
		false,
	);
	assert.equal(isRaWriteRequest("POST", "/user/refresh"), false);
});

test('flag: зөвхөн "1" үед бодит бичилт', () => {
	delete process.env[FLAG];
	assert.equal(shouldDryRun("POST", "/customer/recruitments/new"), true);
	process.env[FLAG] = "true";
	assert.equal(shouldDryRun("POST", "/customer/recruitments/new"), true);
	process.env[FLAG] = "1";
	assert.equal(shouldDryRun("POST", "/customer/recruitments/new"), false);
	assert.equal(shouldDryRun("GET", "/customer/recruitments/statistics"), false);
});

test("fake id руу хэзээ ч сүлжээгээр явахгүй (flag-аас үл хамаарна)", () => {
	process.env[FLAG] = "1";
	const id = makeDryRunId();
	assert.match(
		id,
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/,
	);
	assert.equal(isDryRunId(id), true);
	assert.equal(isDryRunId("9547a97a-342d-4db2-9b40-8e9ef400aee5"), false);
	assert.equal(shouldDryRun("GET", `/customer/recruitments/${id}`), true);
});

test("stub: openapi-ийн хариуны хэлбэр", () => {
	const created = buildDryRunResponse("POST", "/customer/recruitments/new", {
		str: "Нягтлан",
	});
	assert.equal(created.status, 200);
	assert.equal(isDryRunId(created.data), true);
	assert.deepEqual(
		buildDryRunResponse(
			"POST",
			"/customer/recruitment-setup/x/update-information",
			{},
		).data,
		{ message: "", status: 200, success: true, data: "ok" },
	);
	assert.equal(
		buildDryRunResponse(
			"POST",
			"/customer/hiring-invitations/search-by-email",
			{},
		).data.data,
		null,
	);
	assert.deepEqual(
		buildDryRunResponse("POST", "/customer/role-assessments/recommend", [])
			.data,
		[],
	);
	const note = buildDryRunResponse(
		"POST",
		"/customer/hiring-invitations/i/notes/add",
		{
			str: "сайн",
		},
	).data;
	assert.equal(note.note, "сайн");
	const extend = buildDryRunResponse(
		"POST",
		"/customer/hiring-invitations/i/extend",
		{
			value: "2026-10-10",
		},
	).data;
	assert.equal(extend.dueDate, "2026-10-10");
});

test("stub: fake ноорогийн GET", () => {
	const id = makeDryRunId();
	const detail = buildDryRunResponse(
		"GET",
		`/customer/recruitments/${id}`,
	).data;
	assert.equal(detail.status, "CREATED");
	assert.deepEqual(detail.tests, []);
	assert.deepEqual(
		buildDryRunResponse("GET", `/customer/recruitment-setup/${id}/tests`).data,
		[],
	);
	assert.equal(
		buildDryRunResponse("GET", `/customer/hiring-invitations/list/${id}`).data
			.totalElements,
		0,
	);
	const missing = buildDryRunResponse(
		"GET",
		`/customer/hiring-invitations/${id}/rate`,
	);
	assert.equal(missing.status, 404);
	assert.equal(missing.data.code, "not_found");
});

test("log: хувийн мэдээлэл маскална", () => {
	const masked = maskForLog({
		recruitmentId: "9547a97a-342d-4db2-9b40-8e9ef400aee5",
		email: "bold@example.mn",
		firstName: "Болд",
		lastName: "Бат",
		phoneNumber: "99112233",
		dueDate: "2026-10-10",
	});
	assert.deepEqual(masked, {
		recruitmentId: "9547a97a-342d-4db2-9b40-8e9ef400aee5",
		email: "b***@example.com",
		firstName: "Б***",
		lastName: "Б***",
		phoneNumber: "9***",
		dueDate: "2026-10-10",
	});
	assert.deepEqual(maskForLog({ str: "нууц тэмдэглэл" }), {
		str: "<14 тэмдэгт>",
	});
	assert.deepEqual(
		maskForLog({ str: "9547a97a-342d-4db2-9b40-8e9ef400aee5" }),
		{
			str: "9547a97a-342d-4db2-9b40-8e9ef400aee5",
		},
	);
	assert.equal(
		formatDryRunLog("post", "/customer/recruitments/close", { str: "x" }),
		'[RA DRY-RUN] POST /customer/recruitments/close {"str":"<1 тэмдэгт>"}',
	);
});
