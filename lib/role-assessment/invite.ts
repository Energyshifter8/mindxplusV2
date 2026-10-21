export const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const INVITE_EMAIL_MAX = 50;
export const INVITE_NAME_MIN = 2;
export const INVITE_NAME_MAX = 20;

export interface InviteFormInput {
	email: string;
	firstName: string;
	lastName: string;
}

function nameError(value: string, label: string): string | null {
	const text = value.trim();
	if (!text) return `${label} оруулна уу`;
	if (text.length < INVITE_NAME_MIN || text.length > INVITE_NAME_MAX) {
		return `${label} ${INVITE_NAME_MIN}-${INVITE_NAME_MAX} тэмдэгт байна`;
	}
	return null;
}

export function inviteFormError(input: InviteFormInput): string | null {
	const lastName = nameError(input.lastName, "Овог");
	if (lastName) return lastName;
	const firstName = nameError(input.firstName, "Нэр");
	if (firstName) return firstName;
	const email = input.email.trim();
	if (!email) return "Имэйл оруулна уу";
	if (email.length > INVITE_EMAIL_MAX) {
		return `Имэйл хаяг ${INVITE_EMAIL_MAX} тэмдэгтээс ихгүй байна`;
	}
	if (!EMAIL_SHAPE.test(email)) return "Имэйл хаяг буруу байна!";
	return null;
}
