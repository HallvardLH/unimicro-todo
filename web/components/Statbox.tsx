import { Checkbox } from "./ui/checkbox";
import { BookCheck, CircleCheck, Clock, BookAlert } from "lucide-react";

interface StatBoxProps {
    variant: "total" | "completed" | "incomplete" | "overdue",
    value: string | number,
    label: string,
    onClick?: () => void,
    isActive: boolean,
    showCheckbox?: boolean,
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