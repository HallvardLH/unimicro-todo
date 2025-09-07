"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTodos, Todo } from "../../hooks/useTodo";
import { SearchInput } from "./SearchInput";
import { CreateTodo } from "./CreateTodo";
import { TodoHeader } from "./TodoHeader";
import { OrderSelect } from "./OrderSelect";
import { Spinner } from '@/components/ui/shadcn-io/spinner';
import { TodoItemsList } from "./TodoItemsList";
import { InfiniteScrollSentinel } from "./InfiniteScrollSentinel";

/**
 * TodoList component
 * 
 * Displays a searchable, sortable, and filterable list of todos with infinite scrolling.
 * Uses the useTodos hook for fetching, updating, and deleting todos.
 */

export function TodoList() {
    /** Current search input value */
    const [searchTerm, setSearchTerm] = useState("");
    /** Debounced search term used for querying */
    const [debouncedSearch, setDebouncedSearch] = useState("");

    /** State for filtering todos */
    const [filters, setFilters] = useState({
        completed: false,
        incomplete: false,
        overdue: false,
    });

    /** Sorting state: which field to sort by */
    const [orderBy, setOrderBy] = useState<"CreatedAt" | "DueDate" | "Title">("CreatedAt");
    /** Sorting order: ascending or descending */
    const [ascending, setAscending] = useState<boolean>(false);

    /** Number of todos per page for pagination */
    const pageSize = 20;

    /**
     * Toggle a filter on/off.
     * Ensures only one of completed/incomplete is active at a time.
     * @param filter The filter to toggle: "completed" | "incomplete" | "overdue"
     */
    const toggleFilter = (filter: "completed" | "incomplete" | "overdue") => {
        setFilters(prev => {
            if (filter === "completed") return { ...prev, completed: !prev.completed, incomplete: false };
            if (filter === "incomplete") return { ...prev, incomplete: !prev.incomplete, completed: false };
            if (filter === "overdue") return { ...prev, overdue: !prev.overdue };
            return prev;
        });
    };

    /** Convert filter state to query parameters */
    const completedFilter =
        filters.completed && !filters.incomplete
            ? true
            : !filters.completed && filters.incomplete
                ? false
                : undefined;

    const overdueFilter = filters.overdue ? true : undefined;

    // debounce search term to reduce API calls and make UX a bit better
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

    /** Flatten paginated results and remove duplicates */
    const allTasks: Todo[] = data?.pages
        .flatMap(page => page.tasks)
        .filter((todo, index, self) => index === self.findIndex(t => t.id === todo.id)) ?? [];

    const totalCount = data?.pages[0]?.totalCount ?? 0;
    const completedCount = data?.pages[0]?.completedCount ?? 0;

    /** Ref for infinite scroll sentinel */
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    /** Infinite scroll observer */
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

    if (isLoading) return <Spinner />;
    if (isError) return <p>Error: {(error as Error).message}</p>;

    return (
        <div className="max-w-xl w-xl mx-auto space-y-4 text-center">
            <h1 className="text-5xl font-bold mb-2">Todo List</h1>

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

            <SearchInput value={searchTerm} onSearchChange={setSearchTerm} />

            <div className="flex justify-between">
                <OrderSelect
                    value={orderBy}
                    onSetOrderBy={setOrderBy}
                    ascending={ascending}
                    onSetAscending={setAscending}
                />
                <CreateTodo search={debouncedSearch} />
            </div>

            <TodoItemsList todos={allTasks} updateTodo={updateTodo} deleteTodo={deleteTodo} />

            <InfiniteScrollSentinel refCallback={loadMoreRef} isFetching={isFetchingNextPage} hasNextPage={hasNextPage} />
        </div>
    );
}
