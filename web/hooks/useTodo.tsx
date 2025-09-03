"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// The query functions are defined outside of the hook for readability
// and to keep the hook body clean. This also makes them easier to test
// in isolation, and avoids creating new function objects on every render

// Fetch all todos
const fetchTodos = async (search?: string): Promise<Todo[]> => {
    const url = new URL("http://localhost:5083/api/todo");

    if (search && search.trim()) {
        url.searchParams.append("query", search.trim());
    }

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch todos");
    return res.json();
};

// Add a todo
const createTodo = async ({ title, tags }: CreateTodoInput): Promise<Todo> => {
    const res = await fetch("http://localhost:5083/api/todo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, tags: tags || [], completed: false }),
    });
    if (!res.ok) {
        let message = "Failed to add todo";
        try {
            const errorData = await res.json();

            if (errorData.errors) {
                // ASP.NET ModelState error format
                message = Object.values(errorData.errors)
                    .flat()
                    .join(" ");
            } else if (errorData.title) {
                // Sometimes ASP.NET returns a 'title'
                message = errorData.title;
            }
        } catch {
            // response wasn't JSON
        }

        throw new Error(message);
    }
    return res.json();
};

// Update a todo
const updateTodoApi = async (todo: Todo): Promise<Todo> => {
    const res = await fetch(`http://localhost:5083/api/todo/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todo),
    });
    if (!res.ok) throw new Error("Failed to update todo");
    return res.json();
};

// Delete a todo
const deleteTodoApi = async (id: string): Promise<void> => {
    const res = await fetch(`http://localhost:5083/api/todo/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete todo");
};

export const useTodos = (search?: string) => {
    const queryClient = useQueryClient();

    // This is the basic query function
    // It fetches all todos from the API
    const todosQuery = useQuery<Todo[]>({
        queryKey: ["todos", search],
        queryFn: () => fetchTodos(search),
        // React Query handles caching, loading and errors automatically
    });



    // Mutations
    const addTodo = useMutation<Todo, Error, CreateTodoInput>({
        mutationFn: createTodo,
        onSuccess: (newTodo) => {
            // Optimistically update cached todos by appending the new one
            queryClient.setQueryData<Todo[]>(["todos", search], (old = []) => [...old, newTodo]);
            // Refetch to include new todo
            queryClient.invalidateQueries({ queryKey: ["todos"] });
        },
    });

    const updateTodo = useMutation<Todo, Error, Todo, { previous: Todo[] | undefined }>({
        mutationFn: updateTodoApi,
        onMutate: async (updatedTodo) => {
            // Cancelling any outgoing queries, this avoids race conditions
            await queryClient.cancelQueries({ queryKey: ["todos", search] });

            // We keep the previous value in case of an error
            const previous = queryClient.getQueryData<Todo[]>(["todos", search]);

            // Optimistically updating the cache with the updated todo
            queryClient.setQueryData<Todo[]>(["todos", search], (old = []) =>
                old.map((t) => (t.id === updatedTodo.id ? updatedTodo : t))
            );

            // The previous value is returned to be used in OnError
            return { previous };
        },
        onError: (_err, _variables, context) => {
            // Go back to previous data if the update fails
            if (context?.previous) {
                queryClient.setQueryData<Todo[]>(["todos", search], context.previous);
            }
        },
        // On success, we refetch to ensure everything is consitent
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["todos", search] }),
    });

    const deleteTodo = useMutation<void, Error, string, { previous: Todo[] | undefined }>({
        mutationFn: deleteTodoApi,
        onMutate: async (id) => {
            // Cancel ongoing queries
            await queryClient.cancelQueries({ queryKey: ["todos", search] });

            // Save current data
            const previous = queryClient.getQueryData<Todo[]>(["todos", search]);

            // Optimistically remove todo
            queryClient.setQueryData<Todo[]>(["todos", search], (old = []) =>
                old.filter(t => t.id !== id)
            );

            return { previous };
        },
        onError: (_err, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData<Todo[]>(["todos", search], context.previous);
            }
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["todos", search] }),
    });

    return {
        todosQuery,
        addTodo,
        updateTodo,
        deleteTodo,
    };
};
