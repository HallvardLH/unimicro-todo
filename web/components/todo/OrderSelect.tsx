import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { SortAsc, SortDesc } from "lucide-react";

interface OrderSelectProps {
    /** The currently selected field to sort by */
    value: "CreatedAt" | "DueDate" | "Title";

    /** Function to update the selected sort field */
    onSetOrderBy: React.Dispatch<React.SetStateAction<"CreatedAt" | "DueDate" | "Title">>;

    /** Indicates whether the sorting is ascending (true) or descending (false) */
    ascending: boolean;

    /** Function to toggle the ascending/descending state */
    onSetAscending: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * OrderSelect component allows users to select a field to sort by
 * and toggle between ascending and descending order.
 *
 * @param {OrderSelectProps} props - Props for configuring the sort field and order
 *
 * @example
 * <OrderSelect
 *   value={orderBy}
 *   onSetOrderBy={setOrderBy}
 *   ascending={ascending}
 *   onSetAscending={setAscending}
 * />
 */
export function OrderSelect({
    value,
    onSetOrderBy,
    ascending,
    onSetAscending,
}: OrderSelectProps) {
    return (
        <div className="flex items-center gap-2">
            <Select
                value={value}
                onValueChange={(val) =>
                    onSetOrderBy(val as "CreatedAt" | "DueDate" | "Title")
                }
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Order By</SelectLabel>
                        <SelectItem value="CreatedAt">Created At</SelectItem>
                        <SelectItem value="DueDate">Due Date</SelectItem>
                        <SelectItem value="Title">Title</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>

            {/* Asc/Desc toggle button */}
            <button
                type="button"
                onClick={() => onSetAscending((prev) => !prev)}
                className="p-2 rounded-md border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label={ascending ? "Sort ascending" : "Sort descending"}
            >
                {ascending ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </button>
        </div>
    );
}