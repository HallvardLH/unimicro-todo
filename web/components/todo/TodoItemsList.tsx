import { motion, AnimatePresence } from "framer-motion";
import { Todo, useTodos } from "../../hooks/useTodo";
import { TodoItem } from "./TodoItem";

interface TodoItemsListProps {
    /** Array of todos to render */
    todos: Todo[];
    /** Mutation function for updating a todo */
    updateTodo: ReturnType<typeof useTodos>["updateTodo"];
    /** Mutation function for deleting a todo */
    deleteTodo: ReturnType<typeof useTodos>["deleteTodo"];
}

/**
 * TodoItemsList component
 * 
 * Rendrs a list of TodoItem components with smooth animations using Framer Motion.
 * Supports update and delete operations for each todo.
 */
export function TodoItemsList({ todos, updateTodo, deleteTodo }: TodoItemsListProps) {
    return (
        <AnimatePresence>
            {todos.map((todo) => (
                <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                >
                    <TodoItem todo={todo} updateTodo={updateTodo} deleteTodo={deleteTodo} />
                </motion.div>
            ))}
        </AnimatePresence>
    );
}