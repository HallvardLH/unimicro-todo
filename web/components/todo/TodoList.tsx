"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTodos, Todo } from "../../hooks/useTodo";
import { SearchInput } from "./SearchInput";
import { TodoItem } from "./TodoItem";
import { CreateTodo } from "./CreateTodo";
import { TodoHeader } from "./TodoHeader";

export function TodoList() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [filters, setFilters] = useState({
        completed: false,
        incomplete: false,
        overdue: false,
    })

    const [orderBy, setOrderBy] = useState<"CreatedAt" | "DueDate" | "Title">("CreatedAt");
    const [ascending, setAscending] = useState<boolean>(false);

    const pageSize = 20;

    const toggleFilter = (filter: "completed" | "incomplete" | "overdue") => {
        setFilters(prev => {
            if (filter === "completed") {
                return { ...prev, completed: !prev.completed, incomplete: false }
            }
            if (filter === "incomplete") {
                return { ...prev, incomplete: !prev.incomplete, completed: false }
            }
            if (filter === "overdue") {
                return { ...prev, overdue: !prev.overdue }
            }
            return prev
        })
    }

    const completedFilter =
        filters.completed && !filters.incomplete
            ? true
            : !filters.completed && filters.incomplete
                ? false
                : undefined;

    const overdueFilter = filters.overdue ? true : undefined;

    // debounce search term
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { todosQuery, updateTodo, deleteTodo } = useTodos(
        debouncedSearch,
        pageSize,
        completedFilter,
        overdueFilter,
        orderBy,
        ascending
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

    const allTasks: Todo[] = data?.pages
        .flatMap(page => page.tasks)
        .filter((todo, index, self) => index === self.findIndex(t => t.id === todo.id)) ?? [];

    const totalCount = data?.pages[0]?.totalCount ?? 0;
    const completedCount = data?.pages[0]?.completedCount ?? 0;

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

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Error: {(error as Error).message}</p>;

    return (
        <div className="max-w-xl w-xl mx-auto space-y-4 text-center">
            <h1 className="text-5xl font-bold mb-2">Todo List</h1>

            {/* Stats */}
            <TodoHeader
                totalCount={totalCount}
                completedCount={completedCount}
                overdueCount={allTasks.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length}
                onToggleFilter={toggleFilter}
                filters={{
                    completed: filters.completed,
                    incomplete: filters.incomplete,
                    overdue: filters.overdue,
                }}
            />

            {/* Search bar */}
            <SearchInput value={searchTerm} onSearchChange={setSearchTerm} />

            {/* Sort options */}
            <div className="flex justify-center gap-4 my-2">
                <select value={orderBy} onChange={e => setOrderBy(e.target.value as any)}>
                    <option value="CreatedAt">Created At</option>
                    <option value="DueDate">Due Date</option>
                    <option value="Title">Title</option>
                </select>
                <button onClick={() => setAscending(prev => !prev)}>
                    {ascending ? "Ascending" : "Descending"}
                </button>
            </div>

            <div className="flex justify-between">
                <span className="text-2xl font-bold">To be done</span>
                <CreateTodo search={debouncedSearch} />
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
                        <TodoItem todo={todo} updateTodo={updateTodo} deleteTodo={deleteTodo} />
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
