import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Trash, Pencil } from "lucide-react";
import { Badge } from "./ui/badge";
import { Todo } from "@/hooks/useTodo";
import { format } from "date-fns";
import { UseMutationResult } from "@tanstack/react-query";

interface TodoItemProps {
    todo: Todo;
    updateTodo: UseMutationResult<Todo, Error, Todo, { previous: Todo[] | undefined }>;
    deleteTodo: UseMutationResult<void, Error, string, { previous: Todo[] | undefined }>;
}

export function TodoItem({ todo, updateTodo, deleteTodo }: TodoItemProps) {
    return (
        <Card className="flex flex-col p-4 gap-2">
            {/* Top row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        checked={todo.completed}
                        onCheckedChange={checked =>
                            updateTodo.mutate({ ...todo, completed: !!checked })
                        }
                    />
                    <span className={todo.completed ? "line-through text-gray-400" : ""}>
                        {todo.title}
                    </span>
                </div>

                <button onClick={() => deleteTodo.mutate(todo.id)}>
                    <Pencil className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                </button>
            </div>

            {/* Bottom row */}
            <div className="flex flex-col gap-2">
                {/* Tags */}
                {todo.tags && todo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {todo.tags.map((tag, idx) => (
                            <Badge key={idx}>{tag}</Badge>
                        ))}
                    </div>
                )}

                {/* Dates */}
                {todo.dueDate && (
                    <p className="text-sm text-gray-500">
                        Due: {format(new Date(todo.dueDate), "PPP p")}
                    </p>
                )}
            </div>
        </Card>
    );
}
