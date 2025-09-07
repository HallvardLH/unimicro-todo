import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { Todo } from "@/hooks/useTodo";
import { format } from "date-fns";
import { UseMutationResult } from "@tanstack/react-query";
import { EditTodo } from "./EditTodo";
import { motion } from "framer-motion";
interface TodoItemProps {
    todo: Todo;
    updateTodo: UseMutationResult<Todo, Error, Todo, unknown>;
    deleteTodo: UseMutationResult<void, Error, string, unknown>;
}

export function TodoItem({ todo, updateTodo, deleteTodo }: TodoItemProps) {

    return (
        <Card className="flex flex-col justify-center p-4 gap-2 min-h-18 ">
            {/* Top row */}
            <div className="flex items-start gap-3">
                <div className="flex gap-2 self-center items-center space-x-2 flex-[1_1_50%]">
                    <motion.div
                        whileTap={{ scale: 0.9 }} // shrink slightly on click
                        animate={{ scale: todo.completed ? 1.1 : 1 }} // pop when checked
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                        <Checkbox
                            checked={todo.completed}
                            onClick={() =>
                                updateTodo.mutate({ ...todo, completed: !todo.completed })
                            }
                        />
                    </motion.div>

                    {/* Groups title and tags beneath one another */}
                    <div className="flex flex-col text-left">
                        <span>
                            {todo.title}
                        </span>
                        {todo.dueDate && (
                            <p className="text-sm text-gray-500">
                                Due {format(new Date(todo.dueDate), "d MMM")}
                            </p>
                        )}

                    </div>
                </div>

                <div className="flex flex-[1_1_50%] flex-col gap-2 self-start">
                    {todo.tags && todo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {todo.tags.map((tag, idx) => (
                                <Badge key={idx}>{tag}</Badge>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0">
                    <EditTodo
                        todo={todo}
                        updateTodo={updateTodo}
                        deleteTodo={deleteTodo}
                    />
                    {/* {todo.completed && (
                        <button onClick={() => deleteTodo.mutate(todo.id)}>
                            <Trash className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                        </button>
                    )} */}
                </div>
            </div>

        </Card>
    );
}
