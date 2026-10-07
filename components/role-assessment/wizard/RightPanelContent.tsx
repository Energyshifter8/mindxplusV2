"use client";

import {
	rightStepView,
	WIZARD_STEPS,
	type WizardQuestion,
	type WizardState,
	type WizardStep,
	type WizardTest,
} from "@/lib/role-assessment/wizard";
import {
	RightStepTitle,
	SelectedQuestionsList,
	SelectedTestsList,
	StepSummary,
} from "./RightPanel";
import { RightSteps } from "./Steppers";

// Staging баруун sticky карт (📦 `ei`-ийн "right_menu_steps"): алхам бүрийн төлөв,
// тоолуур ("R/maxTestCount", "Q/maxQuestionCount"), идэвхтэй алхамд сонголтын жагсаалт,
// доор нэгтгэл.

const fmtMax = (n: number, max: number) =>
	Number.isFinite(max) ? `${n}/${max}` : String(n);

export function RightPanelContent({
	state,
	visited,
	selectedTests,
	selectedQuestions,
	selectedTestCount,
	selectedQuestionCount,
	maxTests,
	maxQuestions,
	onSelectStep,
	onRemoveTest,
	onRemoveQuestion,
	summary,
}: {
	state: WizardState;
	visited: WizardStep[];
	selectedTests: WizardTest[];
	selectedQuestions: WizardQuestion[];
	selectedTestCount: number;
	selectedQuestionCount: number;
	maxTests: number;
	maxQuestions: number;
	onSelectStep: (step: WizardStep) => void;
	onRemoveTest: (id: string) => void;
	onRemoveQuestion: (id: number) => void;
	summary: {
		testsQuestionTotal: number;
		testsDuration: { min: number; max: number };
		fullDuration: { min: number; max: number };
	};
}) {
	const { step } = state;
	return (
		<>
			<RightSteps
				current={step}
				items={WIZARD_STEPS.map((s) => {
					const current = step === s.number;
					const seen = visited.includes(s.number);
					const showList =
						s.number === 2 || s.number === 3
							? seen && current
							: seen && (current || step > s.number);
					const view = rightStepView(s.number, state);
					return {
						number: s.number,
						status: view.status,
						label: `${s.title} алхам руу шилжих`,
						onSelect: () => onSelectStep(s.number),
						title: (
							<RightStepTitle
								title={s.title}
								current={current}
								badge={view.badge}
								count={
									s.number === 2
										? fmtMax(selectedTestCount, maxTests)
										: s.number === 3
											? fmtMax(selectedQuestionCount, maxQuestions)
											: undefined
								}
							/>
						),
						description: current ? (
							<div>
								{s.number === 2 && showList && (
									<SelectedTestsList
										tests={selectedTests}
										onRemove={onRemoveTest}
										readOnly={state.readOnly}
									/>
								)}
								{s.number === 3 && showList && (
									<SelectedQuestionsList
										questions={selectedQuestions}
										onRemove={onRemoveQuestion}
										readOnly={state.readOnly}
									/>
								)}
							</div>
						) : null,
					};
				})}
			/>
			{step !== 1 && (
				<StepSummary
					step={step}
					testCount={selectedTestCount}
					totalQuestions={summary.testsQuestionTotal}
					questionCount={selectedQuestionCount}
					duration={step === 2 ? summary.testsDuration : summary.fullDuration}
				/>
			)}
		</>
	);
}
