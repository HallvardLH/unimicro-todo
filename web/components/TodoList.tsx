"use client";

import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { useTodos } from "../hooks/useTodo";
import { Badge } from "./ui/badge";
import { Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchInput } from "./SearchInput";
import { format } from "date-fns";

export function TodoList() {
    const [newTitle, setNewTitle] = useState("");
    const [newTags, setNewTags] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { todosQuery, addTodo, updateTodo, deleteTodo } = useTodos(debouncedSearch);

    if (todosQuery.isLoading) return <p>Loading...</p>;
    if (todosQuery.isError) return <p>Error loading todos</p>;

    const handleAdd = () => {
        const tagsArray = newTags
            .split(",")
            .map(t => t.trim())
            .filter(t => t.length > 0);

        addTodo.mutate({ title: newTitle, tags: tagsArray });
    };

    const completedCount = todosQuery.data?.filter(t => t.completed).length ?? 0;
    const totalCount = todosQuery.data?.length ?? 0;

    return (
        <div className="w-full max-w-xl mx-auto space-y-4">
            {/* Search bar */}
            <SearchInput value={searchTerm} onSearchChange={setSearchTerm} />

            {/* Input for adding new todos */}
            <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="New todo"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                    />
                    <input
                        type="text"
                        placeholder="Tags (comma-separated)"
                        value={newTags}
                        onChange={e => setNewTags(e.target.value)}
                        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={addTodo.isPending}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {addTodo.isPending ? "Adding..." : "Add"}
                    </button>
                </div>
                {addTodo.isError && (
                    <p className="text-red-500 text-sm">
                        {addTodo.error.message || "Failed to add todo."}
                    </p>
                )}
            </div>

            {/* List of todos */}
            <AnimatePresence>
                {todosQuery.data?.map(todo => (
                    <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="flex flex-row space-y-2 p-4">
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

                            {/* Tags */}
                            {todo.tags && (
                                <div className="flex flex-wrap gap-2">
                                    {todo.tags.map((tag, idx) => (
                                        <Badge key={idx}>{tag}</Badge>
                                    ))}
                                </div>
                            )}

                            {/* Dates */}
                            <div className="text-sm text-gray-500">
                                <p>Created: {format(new Date(todo.createdAt), "PPP p")}</p>
                                {todo.dueDate && <p>Due: {format(new Date(todo.dueDate), "PPP p")}</p>}
                            </div>

                            {/* Delete button */}
                            <button
                                onClick={() => deleteTodo.mutate(todo.id)}
                                className="text-red-500 hover:underline self-start mt-1"
                            >
                                <Trash />
                            </button>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Footer */}
            <Card className="p-4">
                <p>
                    {completedCount} / {totalCount} completed
                </p>
            </Card>
        </div>
    );
}
