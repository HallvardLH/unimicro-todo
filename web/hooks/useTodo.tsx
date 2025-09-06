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
    pageSize: number = 20
): Promise<TodosResponse> => {
    const url = new URL(`${API_BASE}/api/todo`);
    if (search?.trim()) url.searchParams.append("searchTerm", search.trim());
    url.searchParams.append("skip", (page * pageSize).toString());
    url.searchParams.append("take", pageSize.toString());

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


export const useTodos = (search?: string, pageSize: number = 20) => {
    const queryClient = useQueryClient();

    const todosQuery = useInfiniteQuery<TodosResponse, Error, TodosCache, [string, string?], number>({
        queryKey: ["todos", search],
        queryFn: ({ pageParam = 0 }) => fetchTodos(search, pageParam, pageSize),
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            const loaded = allPages.length * pageSize;
            return loaded < lastPage.totalCount ? allPages.length : undefined;
        },
    });

    // Helper type for cache data
    type TodosCache = InfiniteData<TodosResponse, number>;

    const addTodo = useMutation<Todo, Error, CreateTodoInput>({
        mutationFn: createTodo,
        onSuccess: (newTodo) => {
            queryClient.setQueryData<TodosCache>(["todos", search], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page, idx) =>
                        idx === 0
                            ? {
                                ...page,
                                tasks: [newTodo, ...page.tasks.filter(t => t.id !== newTodo.id)],
                                totalCount: page.totalCount + 1,
                            }
                            : page
                    ),
                };
            });
        },
    });

    const updateTodo = useMutation<Todo, Error, Todo>({
        mutationFn: updateTodoApi,
        onSuccess: (updatedTodo) => {
            queryClient.setQueryData<TodosCache>(["todos", search], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        tasks: page.tasks.map((t) =>
                            t.id === updatedTodo.id ? updatedTodo : t
                        ),
                    })),
                };
            });
        },
    });

    const deleteTodo = useMutation<void, Error, string>({
        mutationFn: deleteTodoApi,
        onSuccess: (_data, id) => {
            queryClient.setQueryData<TodosCache>(["todos", search], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        tasks: page.tasks.filter((t) => t.id !== id),
                        totalCount: page.totalCount - 1,
                    })),
                };
            });
        },
    });


    return {
        todosQuery,
        addTodo,
        updateTodo,
        deleteTodo,
    };
};
