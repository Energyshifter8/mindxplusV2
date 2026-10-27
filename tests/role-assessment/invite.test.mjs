import assert from "node:assert/strict";
import { test } from "node:test";
import {
	INVITE_EMAIL_MAX,
	inviteFormError,
} from "../../lib/role-assessment/invite.ts";

const valid = {
	email: "talent@example.com",
	firstName: "Бат",
	lastName: "Дорж",
};

test("урилгын form: swagger-ийн хязгаар", () => {
	assert.equal(inviteFormError(valid), null);
	assert.equal(inviteFormError({ ...valid, lastName: " " }), "Овог оруулна уу");
	assert.equal(inviteFormError({ ...valid, firstName: "" }), "Нэр оруулна уу");
	assert.equal(
		inviteFormError({ ...valid, firstName: "Б" }),
		"Нэр 2-20 тэмдэгт байна",
	);
	assert.equal(
		inviteFormError({ ...valid, lastName: "Д".repeat(21) }),
		"Овог 2-20 тэмдэгт байна",
	);
	assert.equal(
		inviteFormError({ ...valid, firstName: "-Бат" }),
		"Нэр үсгээр эхлэх ёстой",
	);
	assert.equal(inviteFormError({ ...valid, lastName: "Дорж-Очир" }), null);
	assert.equal(inviteFormError({ ...valid, email: "" }), "Имэйл оруулна уу");
	assert.equal(
		inviteFormError({ ...valid, email: "talent@example" }),
		"Имэйл хаяг буруу байна!",
	);
	assert.equal(
		inviteFormError({
			...valid,
			email: `${"a".repeat(INVITE_EMAIL_MAX)}@example.com`,
		}),
		`Имэйл хаяг ${INVITE_EMAIL_MAX} тэмдэгтээс ихгүй байна`,
	);
});
