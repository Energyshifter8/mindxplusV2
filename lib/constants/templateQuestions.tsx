import { CircleDot, Hash, Type } from "lucide-react";

function SingleChoiceIcon() {
	return <CircleDot size={14} className="text-muted-foreground" />;
}

function NumberRateIndicator() {
	return <Hash size={14} className="text-muted-foreground" />;
}

function TextIndicator() {
	return <Type size={14} className="text-muted-foreground" />;
}

export interface TemplateQuestion {
	title: string;
	content: string;
	template: string;
	options?: Array<{ order: number; content: string }>;
	questionType: string;
	icon: React.ReactNode;
	sortOrder: number;
}

export const templateQuestionsMock: TemplateQuestion[] = [
	{
		title: "Хүйс",
		template: "GENDER",
		content: "Таны хүйс",
		sortOrder: 0,
		questionType: "SINGLE_CHOICE",
		options: [
			{ order: 1, content: "Эмэгтэй" },
			{ order: 2, content: "Эрэгтэй" },
		],
		icon: <SingleChoiceIcon />,
	},
	{
		title: "Нас",
		template: "AGE",
		content: "Таны нас",
		sortOrder: 1,
		questionType: "SINGLE_CHOICE",
		options: [
			{ order: 1, content: "20-24" },
			{ order: 2, content: "25-29" },
			{ order: 3, content: "25-29" },
			{ order: 4, content: "30-34" },
			{ order: 5, content: "35-39" },
			{ order: 6, content: "40-44" },
			{ order: 7, content: "45-49" },
			{ order: 8, content: "50-54" },
			{ order: 9, content: "55-60" },
		],
		icon: <SingleChoiceIcon />,
	},
	{
		title: "Ажлын байрны зэрэглэл",
		template: "JOB_RANK",
		content: "Ажлын байрны зэрэглэл",
		sortOrder: 2,
		questionType: "SINGLE_CHOICE",
		options: [
			{ order: 1, content: "Мэргэжилтэн" },
			{ order: 2, content: "Ахлах мэргэжилтэн" },
			{ order: 3, content: "Менежер" },
			{ order: 4, content: "Ерөнхий/Ахлах менежер" },
			{ order: 5, content: "Алба, хэлтсийн захирал" },
		],
		icon: <SingleChoiceIcon />,
	},
	{
		title: "Ажилласан жил",
		template: "WORK_YEAR",
		content: "Ажилласан жил",
		sortOrder: 3,
		questionType: "SINGLE_CHOICE",
		options: [
			{ order: 1, content: "1 хүртэл жил" },
			{ order: 2, content: "1-3 жил" },
			{ order: 3, content: "4-6 жил" },
			{ order: 4, content: "7-9 жил" },
			{ order: 5, content: "10-аас дээш жил" },
		],
		icon: <SingleChoiceIcon />,
	},
	{
		title: "Харьяалагдах газар хэлтэс",
		template: "DEPARTMENT",
		content: "Харьяалагдах газар хэлтэс",
		sortOrder: 4,
		questionType: "SINGLE_CHOICE",
		options: [
			{ order: 1, content: "Сонголт 1" },
			{ order: 2, content: "Сонголт 2" },
			{ order: 3, content: "Сонголт 3" },
			{ order: 4, content: "Сонголт 4" },
		],
		icon: <SingleChoiceIcon />,
	},
	{
		title: "Сэтгэл ханамж",
		template: "OVERALL_SATISFACTION",
		content: "Ажлын байрны сэтгэл ханамжаа үнэлнэ үү",
		sortOrder: 5,
		questionType: "NUMBER_RATING",
		options: Array.from({ length: 10 }, (_, i) => ({
			order: i + 1,
			content: `${i + 1} оноо`,
		})),
		icon: <NumberRateIndicator />,
	},
	{
		title: "Санал хүсэлт",
		template: "FEEDBACK",
		content: "Танд санал хүсэлт байна уу?",
		sortOrder: 6,
		questionType: "TEXT",
		options: [],
		icon: <TextIndicator />,
	},
];

export function getOptionsPreview(
	options: Array<{ order: number; content: string }> | undefined,
	maxVisible = 2,
): string {
	if (!options || options.length === 0) return "";
	const visible = options.slice(0, maxVisible).map((o) => o.content);
	const remaining = options.length - maxVisible;
	if (remaining > 0) {
		return `${visible.join(", ")}...`;
	}
	return visible.join(", ");
}
