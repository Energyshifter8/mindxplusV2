// antd v5 `<Skeleton active paragraph={{ rows }} />`-ийн DOM ба анхдагч стиль
// (staging /home ачаалах төлөв, 📦 bundle). Шинэ сан нэмэхгүйн тулд гараар хуулав.

const BLOCK =
	"h-4 rounded-[4px] bg-[length:400%_100%] animate-[antd-skeleton_1.4s_ease_infinite]";
const BLOCK_STYLE: React.CSSProperties = {
	backgroundImage:
		"linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.15) 37%, rgba(0,0,0,0.06) 63%)",
};

export function AntdSkeleton({ rows = 3 }: { rows?: number }) {
	return (
		<div className="table w-full" aria-busy="true">
			<div className="table-cell w-full align-top">
				<div className={BLOCK} style={{ ...BLOCK_STYLE, width: "38%" }} />
				<ul className="mt-6 p-0">
					{Array.from({ length: rows }, (_, i) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
							key={i}
							className={`${BLOCK} w-full list-none ${i > 0 ? "mt-4" : ""}`}
							style={{
								...BLOCK_STYLE,
								...(i === rows - 1 ? { width: "61%" } : null),
							}}
						/>
					))}
				</ul>
			</div>
		</div>
	);
}
