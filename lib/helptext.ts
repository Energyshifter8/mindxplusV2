// Toast messages
export const TOAST = {
	SAVE_LOADING: "Хадгалж байна...",
	SAVE_SUCCESS: "Хадгалагдлаа",
	SAVE_ERROR: "Хадгалахад алдаа гарлаа",
	PUBLISH_LOADING: "Нийтэлж байна...",
	PUBLISH_SUCCESS: "Шинжилгээ амжилттай нийтлэгдлээ",
	PUBLISH_ERROR: "Нийтлэхэд алдаа гарлаа",
	FETCH_ERROR: "Мэдээлэл ачаалахад алдаа гарлаа",
	VALIDATION_ERROR: "Шаардлагатай талбаруудыг бөглөнө үү",
	OPTION_DELETE_ERROR: "Хамгийн багадаа нэг сонголт байх ёстой",
	QUESTION_LIMIT: "Дээд тал нь 5 асуулт нэмэх боломжтой",
	UNSAVED_CHANGES: "Хадгалаагүй өөрчлөлт байна. Гарахдаа итгэлтэй байна уу?",
} as const;

// Button labels
export const BUTTON = {
	SAVE: "Хадгалах",
	PUBLISH: "Нийтлэх",
	CANCEL: "Цуцлах",
	RETRY: "Дахин оролдох",
	BACK: "Буцах",
} as const;

// Device labels
export const DEVICE = {
	DESKTOP: "Дэлгэц",
	TABLET: "Таблет",
	MOBILE: "Утас",
} as const;

// TopBar titles
export const TOPBAR = {
	DESIGN: "Дизайн",
	SETTINGS: "Тохиргоо",
} as const;

// Default values
export const DEFAULT = {
	SURVEY_NAME: "Шинжилгээ",
} as const;

// Section labels
export const SECTION = {
	HOMEPAGE: "Нүүр хуудас засах",
	QUESTION: "Асуулт засах",
	ENDING: "Төгсгөл хуудас засах",
} as const;

// Placeholders
export const PLACEHOLDER = {
	SURVEY_NAME: "Шинжилгээний нэр",
	DESCRIPTION: "Тайлбар бичнэ үү...",
	BUTTON_TEXT: "Эхлэх",
	QUESTION_TITLE: "Асуулт оруулах ...",
	ENDING_TITLE: "Баярлалаа!",
	ENDING_DESCRIPTION: "Таны хариултыг хүлээн авлаа.",
	OPTION: "Сонголт",
	OPTION_N: "Сонголтын текст",
	TEXT_INPUT: "Бичвэр оруулах...",
} as const;

// Sidebar
export const SIDEBAR = {
	ADD_QUESTION: "Асуулт нэмэх",
	TEMPLATE_QUESTIONS: ["Нас", "Хүйс", "Албан тушаал", "Хэлтэс"],
} as const;

// Preview
export const PREVIEW = {
	QUESTION_PREFIX: "Асуулт",
	REQUIRED_BADGE: "Заавал",
	POINTS_SUFFIX: "оноо",
} as const;

// Question editor
export const QUESTION = {
	TYPE_LABEL: "Хариултын төрөл",
	TYPE_SINGLE: "Нэг сонголт",
	TYPE_MULTIPLE: "Олон сонголт",
	TYPE_SCALE: "Үнэлгээний шкала",
	TYPE_TEXT: "Бичвэр",
	TYPE_DROPDOWN: "Уналттай сонголт",
	TYPE_STAR_RATING: "Зэрэглэл /Од/",
	TYPE_NUMBER_RATING: "Зэрэглэл /Тоо/",
	TYPE_YES_NO: "Тийм/үгүй",
	REQUIRED: "Заавал бөглөх",
	MIN_ANSWER: "Хамгийн бага хариулт",
	MAX_ANSWER: "Хамгийн их хариулт",
	OPTIONS: "Сонголтууд",
	OPTION_CONTENT: "Сонголтын текст",
	OPTION_POINT: "Оноо",
	ADD_OPTION: "+ Сонголт нэмэх",
	DELETE_QUESTION: "Асуулт устгах",
} as const;

// Publish modal
export const PUBLISH_MODAL = {
	TITLE: "Нийтлэх огноо сонгох",
	DESCRIPTION:
		"Шинжилгээ хаагдах огноог сонгоно уу. Энэ огноогоор шинжилгээ автомат хаагдах болно.",
	DATE_LABEL: "Огноо",
} as const;
