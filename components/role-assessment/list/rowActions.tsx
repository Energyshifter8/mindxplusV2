import {
	CloseSmallIcon,
	DetailIcon,
	EditIcon,
	GearIcon,
	InviteIcon,
	ResultsIcon,
	TrashIcon,
} from "@/components/icons/role-assessment";
import type { RaMenuAction } from "@/components/role-assessment/ui/KebabMenu";
import type { RecruitmentListItem } from "@/lib/types/role-assessment";

// Жагсаалтын мөрийн үйлдэл — статусаас хамаарна (📦 staging жагсаалтын хуудас).

export interface RecruitmentRowHandlers {
	onDetail: (row: RecruitmentListItem) => void;
	onInvite: (id: string) => void;
	onClose: (row: RecruitmentListItem) => void;
	onDelete: (row: RecruitmentListItem) => void;
	onRename: (row: RecruitmentListItem) => void;
	goEdit: (id: string) => void;
	goDashboard: (id: string) => void;
}

/** Мөрийн inline товч: CREATED → Засах, CLOSED → Үр дүн, бусад → Урих. */
export function primaryRowAction(
	row: RecruitmentListItem,
	h: RecruitmentRowHandlers,
): { label: string; icon: React.ReactNode; onSelect: () => void } {
	switch (row.status) {
		case "CREATED":
			return {
				label: "Засах",
				icon: <EditIcon />,
				onSelect: () => h.goEdit(row.id),
			};
		case "CLOSED":
			return {
				label: "Үр дүн",
				icon: <ResultsIcon />,
				onSelect: () => h.goDashboard(row.id),
			};
		default:
			return {
				label: "Урих",
				icon: <InviteIcon />,
				onSelect: () => h.onInvite(row.id),
			};
	}
}

/** "⋮" цэс. */
export function rowMenuActions(
	row: RecruitmentListItem,
	h: RecruitmentRowHandlers,
): RaMenuAction[] {
	const detail: RaMenuAction = {
		key: "detail",
		label: "Дэлгэрэнгүй",
		icon: <DetailIcon />,
		onSelect: () => h.onDetail(row),
	};
	const result: RaMenuAction = {
		key: "result",
		label: "Үр дүн",
		icon: <ResultsIcon />,
		onSelect: () => h.goDashboard(row.id),
	};
	switch (row.status) {
		case "CREATED":
			return [
				detail,
				{
					key: "edit",
					label: "Засах",
					icon: <GearIcon />,
					onSelect: () => h.goEdit(row.id),
				},
				{
					key: "delete",
					label: "Устгах",
					icon: <TrashIcon />,
					variant: "danger",
					onSelect: () => h.onDelete(row),
				},
			];
		case "CLOSED":
			return [result, detail];
		default:
			return [
				{
					key: "invite",
					label: "Урих",
					icon: <InviteIcon />,
					onSelect: () => h.onInvite(row.id),
				},
				result,
				detail,
				{
					key: "close",
					label: "Талентийн үнэлгээ хаах",
					icon: <CloseSmallIcon />,
					onSelect: () => h.onClose(row),
				},
			];
	}
}
