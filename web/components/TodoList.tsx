"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodos } from "../hooks/useTodo";
import { SearchInput } from "./SearchInput";
import { TodoItem } from "./TodoItem";
import { CreateTodo } from "./CreateTodo";

export function TodoList() {
    const [newTitle, setNewTitle] = useState("");
    const [newTags, setNewTags] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const pageSize = 20;

    // debounce search term
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { todosQuery, addTodo, updateTodo, deleteTodo } = useTodos(
        debouncedSearch,
        pageSize
    );

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = todosQuery;

    const allTasks = data?.pages
        .flatMap(page => page.tasks)
        // Ensure no duplicates
        // Duplicates may occur due to optimistic updating upon creating a new task
        .filter((todo, index, self) => index === self.findIndex(t => t.id === todo.id)) ?? [];
    const totalCount = data?.pages[0]?.totalCount ?? 0;
    const completedCount = allTasks.filter((t) => t.completed).length;

    // infinite scroll observer
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!hasNextPage || isFetchingNextPage) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                fetchNextPage();
            }
        });
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleAdd = () => {
        const tagsArray = newTags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);

        addTodo.mutate({ title: newTitle, tags: tagsArray });
        setNewTitle("");
        setNewTags("");
    };

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error: {(error as Error).message}</p>;

    return (
        <div className="w-full max-w-xl mx-auto space-y-4 text-center">
            <h1 className="text-4xl font-bold mb-2">Todo List</h1>
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
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                    />
                    <input
                        type="text"
                        placeholder="Tags (comma-separated)"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
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

            {/* Todo list */}
            <AnimatePresence>
                {allTasks.map((todo) => (
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

            {/* Infinite scroll sentinel */}
            <div
                ref={loadMoreRef}
                className="h-10 flex justify-center items-center text-sm text-muted-foreground"
            >
                {isFetchingNextPage
                    ? "Loading more..."
                    : hasNextPage
                        ? "Scroll to load more"
                        : "No more todos"}
            </div>
        </div>
    );
}
