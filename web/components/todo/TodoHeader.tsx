import { StatBox } from "./Statbox"

interface TodoHeaderProps {
    totalCount: number
    completedCount: number
    overdueCount: number
    filters: { completed: boolean, incomplete: boolean, overdue: boolean }
    onToggleFilter: (filter: "completed" | "incomplete" | "overdue") => void
}

export function TodoHeader({ totalCount, completedCount, overdueCount, filters, onToggleFilter }: TodoHeaderProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <StatBox variant="total" label="Total tasks" value={totalCount} isActive={true} showCheckbox={false} />
            <StatBox variant="completed" label="Completed" value={completedCount} isActive={filters.completed} onClick={() => onToggleFilter("completed")} />
            <StatBox variant="incomplete" label="Incomplete" value={totalCount - completedCount} isActive={filters.incomplete} onClick={() => onToggleFilter("incomplete")} />
            <StatBox variant="overdue" label="Overdue" value={overdueCount} isActive={filters.overdue} onClick={() => onToggleFilter("overdue")} />
        </div>
    )
}
