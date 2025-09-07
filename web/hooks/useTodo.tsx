"use client";

import {
    useMutation,
    useQueryClient,
    useInfiniteQuery,
    InfiniteData,
} from "@tanstack/react-query";

export type Todo = {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string | null;
    tags: string[];
    createdAt: string;
    updatedAt?: string | null;
};

export type CreateTodoInput = {
    title: string;
    tags?: string[];
    completed?: boolean;
    dueDate?: string | null;
};

export type TodosResponse = {
    tasks: Todo[];
    totalCount: number;
    completedCount: number;
    returnedCount: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined in .env.local");
}


// The query functions are defined outside of the hook for readability
// and to keep the hook body clean. This also makes them easier to test
// in isolation, and avoids creating new function objects on every render

// Fetch all todos

const fetchTodos = async (
    search: string | undefined,
    page: number = 0,
    pageSize: number = 20,
    completed?: boolean | null,
    overdue?: boolean | null,
    orderBy: string = "CreatedAt",
    ascending: boolean = false
): Promise<TodosResponse> => {
    const url = new URL(`${API_BASE}/api/todo`);
    if (search?.trim()) url.searchParams.append("searchTerm", search.trim());
    url.searchParams.append("skip", (page * pageSize).toString());
    url.searchParams.append("take", pageSize.toString());
    url.searchParams.append("orderBy", orderBy);
    url.searchParams.append("ascending", ascending.toString());

    if (completed !== null && completed !== undefined) {
        url.searchParams.append("completed", completed.toString());
    }

    if (overdue !== null && overdue !== undefined) {
        url.searchParams.append("overdue", overdue.toString());
    }

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch todos");

    return res.json();
};

const createTodo = async ({ title, tags, dueDate }: CreateTodoInput): Promise<Todo> => {
    const res = await fetch(`${API_BASE}/api/todo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            tags: tags || [],
            completed: false,
            dueDate: dueDate || null,
        }),
    });
    if (!res.ok) {
        let message = "Failed to add todo";
        try {
            const errorData = await res.json();
            if (errorData.errors) {
                message = Object.values(errorData.errors).flat().join(" ");
            } else if (errorData.title) {
                message = errorData.title;
            }
        } catch {
            // ignore if not JSON
        }
        throw new Error(message);
    }
    return res.json();
};

const updateTodoApi = async (todo: Todo): Promise<Todo> => {
    const res = await fetch(`${API_BASE}/api/todo/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
    });
    if (!res.ok) throw new Error("Failed to update todo");
    return res.json();
};

const deleteTodoApi = async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/todo/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete todo");
};


export const useTodos = (
    search?: string,
    pageSize: number = 20,
    completed?: boolean | null,
    overdue?: boolean | null,
    orderBy: string = "CreatedAt",
    ascending: boolean = false
) => {
    const queryClient = useQueryClient();
    const queryKey = ["todos", search, completed ?? undefined, overdue ?? undefined, orderBy ?? undefined, ascending ?? undefined];

    // Helper type for cache data
    type TodosCache = InfiniteData<TodosResponse, number>;

    const todosQuery = useInfiniteQuery<TodosResponse, Error, TodosCache, [string, string?, boolean?, boolean?, string?, boolean?], number>({
        queryKey: ["todos", search, completed ?? undefined, overdue ?? undefined, orderBy ?? undefined, ascending ?? undefined],
        queryFn: ({ pageParam = 0 }) => fetchTodos(search, pageParam, pageSize, completed, overdue, orderBy, ascending),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.tasks.length === pageSize ? allPages.length : undefined;
        },
    });

    const invalidateTodos = () =>
        queryClient.invalidateQueries({ queryKey });

    const addTodo = useMutation<Todo, Error, CreateTodoInput>({
        mutationFn: createTodo,
        onSuccess: (newTodo) => {
            queryClient.setQueryData<TodosCache>(queryKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page, idx) =>
                        idx === 0
                            ? {
                                ...page,
                                tasks: [newTodo, ...page.tasks],
                                returnedCount: page.returnedCount + 1,
                                totalCount: page.totalCount + 1,
                            }
                            : page
                    ),
                };
            });
            //refetch to stay in sync
            queryClient.invalidateQueries({ queryKey });
        },
    });


    const updateTodo = useMutation<Todo, Error, Todo>({
        mutationFn: updateTodoApi,
        onSuccess: invalidateTodos,
    });

    const deleteTodo = useMutation<void, Error, string>({
        mutationFn: deleteTodoApi,
        onSuccess: invalidateTodos,
    });

    return {
        todosQuery,
        addTodo,
        updateTodo,
        deleteTodo,
    };
};
