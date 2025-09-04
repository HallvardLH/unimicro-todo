"use client";

import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { useTodos } from "../hooks/useTodo";
import { motion, AnimatePresence } from "framer-motion";
import { SearchInput } from "./SearchInput";
import { TodoItem } from "./TodoItem";
import { CreateTodo } from "./CreateTodo";

export function TodoList() {
    const [newTitle, setNewTitle] = useState("");
    const [newTags, setNewTags] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Debounce the search by 300ms so that search isn't executed on every single keypress
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
        <div className="w-full max-w-xl mx-auto space-y-4 text-center">
            <h1 className="text-4xl font-bold mb-2">
                Todo List
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
                {completedCount} / {totalCount} completed
            </p>
            {/* Search bar */}
            <SearchInput value={searchTerm} onSearchChange={setSearchTerm} />

            <CreateTodo search={debouncedSearch} />
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
            {/* <Card className="p-2 "> */}
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
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            updateTodo={updateTodo}
                            deleteTodo={deleteTodo}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
            {/* </Card> */}
        </div>
    );
}
