import { Checkbox } from "../ui/checkbox";
import { BookCheck, CircleCheck, Clock, BookAlert } from "lucide-react";

interface StatBoxProps {
    /** Type of statistic to display, determines icon and background */
    variant: "total" | "completed" | "incomplete" | "overdue";
    /** The numeric or string value to display */
    value: string | number;
    /** Label describing the stat box */
    label: string;
    /** Optional click handler for interactivity */
    onClick?: () => void;
    /** Determines if the checkbox is active (checked) */
    isActive: boolean;
    /** Whether to show the checkbox. Default is true */
    showCheckbox?: boolean;
}

const icons = {
    total: BookCheck,
    completed: CircleCheck,
    incomplete: Clock,
    overdue: BookAlert,
};

const backgrounds = {
    total: "#EAFCFF",
    completed: "#E3FFC2",
    incomplete: "#FFF6E7",
    overdue: "#FFDDC9",
}

/**
 * StatBox component
 * 
 * Displays a small statistic card with:
 * - An icon representing the type of stat
 * - Label describing the stat
 * - Numeric or string value
 * - Optional checkbox indicating filter state
 * 
 * Background color and icon change based on the variant.
 * The card can be clickable if onClick is provided.
 */
export function StatBox({ variant, value, label, onClick, isActive, showCheckbox = true }: StatBoxProps) {
    const Icon = icons[variant];
    const background = backgrounds[variant];

    return (
        <div
            onClick={onClick}
            className={`grid grid-cols-2 gap-4 rounded-lg p-4 cursor-pointer`}
            style={{ backgroundColor: background }}
        >
            <Icon className="w-5 h-5 text-gray-600" />
            <div className="self-end flex justify-end">
                {showCheckbox && (
                    <Checkbox checked={isActive} />
                )}
            </div>
            <span className="text-left">{label}</span>
            <div className="self-end flex justify-end">
                <span>{value}</span>
            </div>
        </div>
    );
}