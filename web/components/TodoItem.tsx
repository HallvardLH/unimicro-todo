import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Trash, Pencil, Check, Circle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Todo } from "@/hooks/useTodo";
import { format } from "date-fns";
import { UseMutationResult } from "@tanstack/react-query";
import { Button } from "./ui/button";

import { cn } from "@/lib/utils"

interface TodoItemProps {
    todo: Todo;
    updateTodo: UseMutationResult<Todo, Error, Todo, { previous: Todo[] | undefined }>;
    deleteTodo: UseMutationResult<void, Error, string, { previous: Todo[] | undefined }>;
}

export function TodoItem({ todo, updateTodo, deleteTodo }: TodoItemProps) {
    return (
        <Card className="flex flex-col p-4 gap-2 ">
            {/* Top row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Button
                        size="icon"
                        onClick={() =>
                            updateTodo.mutate({ ...todo, completed: !todo.completed })
                        }
                        className={cn(
                            "p-5",
                            "rounded-full flex-shrink-0 mt-1",
                            todo.completed && "bg-accent text-accent-foreground shadow-soft"
                        )}
                    >
                        {todo.completed ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Circle className="w-4 h-4" />
                        )}
                    </Button>
                    {/* Groups title and tags beneath one another */}
                    <div className="flex flex-col">
                        <span className={todo.completed ? "line-through text-gray-400" : ""}>
                            {todo.title}
                        </span>
                        {todo.tags && todo.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {todo.tags.map((tag, idx) => (
                                    <Badge key={idx}>{tag}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <button onClick={() => deleteTodo.mutate(todo.id)}>
                    <Pencil className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                </button>
            </div>

            {/* Bottom row */}
            <div className="flex flex-col gap-2">
                {/* Tags */}


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
