"use client";

import {
	ClockIcon,
	LightbulbIcon,
	QuestionCircleIcon,
	SparkleSmallIcon,
	StatusClosedCheckIcon,
} from "@/components/icons/role-assessment";
import { RaButton } from "@/components/role-assessment/ui/Button";
import {
	type CategoryOption,
	groupTestsByCategory,
	type TestGroup,
	type WizardTest,
} from "@/lib/role-assessment/wizard";
import { cn } from "@/lib/utils";

const COLOR_CHIP: Record<string, string> = {
	GREEN: "bg-Semantic-success100 text-Semantic-success800",
	YELLOW: "bg-Semantic-warning100 text-Semantic-warning800",
};

export function CategoryButtons({
	categories,
	selected,
	onSelect,
	disabled,
	label,
}: {
	categories: CategoryOption[];
	selected: string;
	onSelect: (key: string) => void;
	disabled: boolean;
	label: string;
}) {
	return categories.map((c) => (
		<RaButton
			key={c.key || "all"}
			variant={selected === c.key ? "outline" : "secondary"}
			size="small"
			title={c.label}
			onClick={() => onSelect(c.key)}
			className={
				selected === c.key
					? "border-Gray-900"
					: "bg-Gray-50 text-TextColor-third"
			}
			disabled={disabled}
			aria-pressed={selected === c.key}
			ariaLabel={`${label}: ${c.label}`}
		/>
	));
}

function TestCard({
	test,
	order,
	recommended,
	onToggle,
	onDetail,
	readOnly,
	titleAs: Title,
}: {
	test: WizardTest;
	order: number;
	recommended: boolean;
	onToggle: (id: string) => void;
	onDetail: (id: string) => void;
	readOnly: boolean;
	titleAs: "h3" | "h4";
}) {
	const selected = order > 0;
	return (
		<div
			className={cn(
				"relative flex !h-[256px] !w-full flex-col justify-between rounded-2xl border-[2px] p-4 transition-shadow",
				!readOnly && "cursor-pointer hover:shadow-md",
				selected ? "border-Gray-400 bg-Gray-50" : "border-Stroke-500 bg-white",
			)}
		>
			{recommended && (
				<div className="absolute -top-[14px] right-[38px] z-40 flex items-center gap-2 rounded-full bg-Semantic-success500 px-3 py-1">
					<SparkleSmallIcon className="text-white" />
					<span className="font-medium text-[14px] text-white leading-5">
						Санал болгох
					</span>
				</div>
			)}
			{selected && (
				<div className="absolute top-4 right-4 z-40 flex h-7 w-7 items-center justify-center rounded-full bg-Gray-800 font-medium text-[16px] text-white leading-5">
					<span className="sr-only">Сонголтын дараалал: </span>
					{order}
				</div>
			)}
			<div>
				<div
					className={cn(
						"inline-block rounded px-3 py-1 font-medium text-[14px] leading-[140%]",
						COLOR_CHIP[test.color] ??
							"bg-Semantic-info100 text-Semantic-info800",
					)}
				>
					{test.categoryLabel}
				</div>
				<Title className="mt-2 min-h-10 text-[16px] text-TextColor-main leading-[140%]">
					{test.title}
				</Title>
				<p className="mt-2 line-clamp-3 text-[14px] text-TextColor-secondary leading-[140%]">
					{test.description}
				</p>
				<div className="mt-2 flex items-center gap-2 text-TextColor-third text-[12px]">
					<div className="flex items-center gap-1">
						<QuestionCircleIcon className="text-TextColor-third" />
						<span className="text-[14px] leading-[140%]">
							{test.questions} асуулт
						</span>
					</div>
					<div className="flex items-center gap-1">
						<ClockIcon className="text-TextColor-third" />
						<span className="text-[14px] leading-[140%]">
							{test.duration} Мин
						</span>
					</div>
				</div>
			</div>
			<div className="mt-4 flex w-full items-center gap-2">
				<RaButton
					variant="outline"
					size="small"
					title="Дэлгэрэнгүй"
					onClick={() => onDetail(test.id)}
					className="w-full"
					disabled={readOnly}
				/>
				<RaButton
					variant={selected ? "outline" : "accent"}
					size="small"
					prefixIcon={selected ? <StatusClosedCheckIcon /> : null}
					title={selected ? "Нэмсэн" : "Нэмэх"}
					onClick={() => onToggle(test.id)}
					className="w-full"
					disabled={readOnly}
					aria-pressed={selected}
				/>
			</div>
		</div>
	);
}

export function StepTests({
	categories,
	selectedCategory,
	onCategory,
	tests,
	selectedIds,
	recommended,
	onToggle,
	onRecommend,
	onDetail,
	loading,
	error,
	readOnly,
}: {
	categories: CategoryOption[];
	selectedCategory: string;
	onCategory: (key: string) => void;
	tests: WizardTest[];
	selectedIds: string[];
	recommended: WizardTest[];
	onToggle: (id: string) => void;
	onRecommend: () => void;
	onDetail: (id: string) => void;
	loading: boolean;
	error: React.ReactNode;
	readOnly: boolean;
}) {
	const groups: TestGroup[] =
		selectedCategory === ""
			? groupTestsByCategory(tests, categories)
			: [{ key: selectedCategory, label: "", tests }];
	return (
		<>
			<div className="mb-6 flex items-start justify-between">
				<div>
					<h2 className="font-medium text-TextColor-main text-base leading-[140%]">
						Тест сонгох
					</h2>
					<p className="mt-2 text-TextColor-third text-base leading-6">
						Талентүүүдийн ур чадвар, зан төлөв, сэтгэлзүйн үзүүлэлтийг үнэлэх
						тестүүдийг сонгоно уу.
					</p>
				</div>
				<RaButton
					prefixIcon={<LightbulbIcon />}
					variant="outline"
					title="Санал болгох"
					onClick={onRecommend}
					disabled={readOnly}
					className="min-w-[188px]"
				/>
			</div>
			<fieldset className="flex items-center gap-2 border-Stroke-500 border-b pb-5">
				<legend className="sr-only">Тестийн ангилал</legend>
				<CategoryButtons
					categories={categories}
					selected={selectedCategory}
					onSelect={onCategory}
					disabled={readOnly}
					label="Ангилал"
				/>
			</fieldset>
			{loading ? (
				<div className="mt-6 flex items-center justify-center py-20">
					<p className="text-[16px] text-TextColor-third">
						Тестүүд ачааллаж байна...
					</p>
				</div>
			) : error ? (
				error
			) : tests.length === 0 ? (
				<div className="mt-6 flex items-center justify-center py-20">
					<p className="text-[16px] text-TextColor-third">Тест олдсонгүй</p>
				</div>
			) : (
				<div className="mt-6 flex flex-col gap-8">
					{groups.map((group) => (
						<section key={group.key || "other"}>
							{group.label && (
								<h3 className="mb-4 flex items-center gap-2 font-medium text-TextColor-main text-base leading-[140%]">
									{group.label}
									<span className="rounded-full bg-Gray-200 px-2 py-0.5 text-[11px] text-TextColor-secondary leading-4">
										{group.tests.length}
									</span>
								</h3>
							)}
							<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
								{group.tests.map((test) => (
									<TestCard
										key={test.id}
										test={test}
										order={selectedIds.indexOf(test.id) + 1}
										recommended={recommended.some((r) => r.id === test.id)}
										onToggle={onToggle}
										onDetail={onDetail}
										readOnly={readOnly}
										titleAs={group.label ? "h4" : "h3"}
									/>
								))}
							</div>
						</section>
					))}
				</div>
			)}
		</>
	);
}
