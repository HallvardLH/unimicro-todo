import { StatBox } from "./Statbox"

interface TodoHeaderProps {
    /** Total number of tasks */
    totalCount: number;
    /** Number of completed tasks */
    completedCount: number;
    /** Number of overdue tasks */
    overdueCount: number;
    /** Current filter states */
    filters: {
        completed: boolean;
        incomplete: boolean;
        overdue: boolean;
    };
    /** Callback to toggle a filter when a StatBox is clicked */
    onToggleFilter: (filter: "completed" | "incomplete" | "overdue") => void;
}

/**
 * TodoHeader component
 * 
 * Displays the summary statistics for the todo list, including:
 * - Total tasks
 * - Completed tasks
 * - Incomplete tasks
 * - Overdue tasks
 * 
 * Each stat box is interactive (except total tasks) and can be clicked to toggle filters.
 */
export function TodoHeader({ totalCount, completedCount, overdueCount, filters, onToggleFilter }: TodoHeaderProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <StatBox
                variant="total"
                label="Total tasks"
                value={totalCount}
                isActive={true}
                showCheckbox={false}
            />
            <StatBox
                variant="completed"
                label="Completed"
                value={completedCount}
                isActive={filters.completed}
                onClick={() => onToggleFilter("completed")}
            />
            <StatBox
                variant="incomplete"
                label="To be done"
                value={totalCount - completedCount}
                isActive={filters.incomplete}
                onClick={() => onToggleFilter("incomplete")}
            />
            <StatBox
                variant="overdue"
                label="Overdue"
                value={overdueCount}
                isActive={filters.overdue}
                onClick={() => onToggleFilter("overdue")}
            />
        </div>
    )
}