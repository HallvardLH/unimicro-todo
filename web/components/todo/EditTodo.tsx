import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import { Todo } from "@/hooks/useTodo";
import { UseMutationResult } from "@tanstack/react-query";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { X, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EditTodoProps {
    todo: Todo;
    updateTodo: UseMutationResult<Todo, Error, Todo, unknown>;
    deleteTodo: UseMutationResult<void, Error, string, unknown>;
}

interface Tag {
    id: string;
    name: string;
}

export function EditTodo({ todo, updateTodo, deleteTodo }: EditTodoProps) {
    const [newTitle, setNewTitle] = useState(todo.title);
    const [newTag, setNewTag] = useState("");
    const [tagList, setTagList] = useState<Tag[]>([]);
    const [dueDate, setDueDate] = useState<string | null>(todo.dueDate ? todo.dueDate : null);
    const [open, setOpen] = useState(false);

    // todo.tags is a simply array of strings,
    // we need to store tagList as an array of Tag objects
    useEffect(() => {
        if (todo.tags && todo.tags.length > 0) {
            const initialTags = todo.tags.map(tag => {
                // If tag is already an object with id, just return it
                if (typeof tag === "object" && "id" in tag) return tag as Tag;
                // If tag is a string, convert it to object
                return { id: crypto.randomUUID(), name: tag } as Tag;
            });
            setTagList(initialTags);
        }
    }, [todo.tags]);

    const removeTag = (id: string) => {
        setTagList(tagList.filter(tag => tag.id !== id));
    };

    const addTag = (name: string) => {
        if (!name) return;
        const newTag = { id: crypto.randomUUID(), name };
        setTagList([...tagList, newTag]);
        setNewTag("");
    };

    const handleUpdate = async () => {
        await updateTodo.mutateAsync({
            title: newTitle,
            tags: tagList.map(tag => tag.name),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            completed: todo.completed,
            createdAt: todo.createdAt,
            id: todo.id,
        });
        setNewTitle("");
        setTagList([]);
        setDueDate(null);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form onSubmit={(e) => { e.preventDefault(); }}>
                <DialogTrigger asChild>
                    <button >
                        <Pencil className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                    </button>
                </DialogTrigger>
                <DialogContent aria-describedby="" className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit task</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6">
                        {/* Task name */}
                        <div className="grid gap-3">
                            <Label htmlFor="name">Edit name</Label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="New task"
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                            />
                        </div>

                        <div className="grid gap-3">
                            <Label htmlFor="tags">Add or remove tags</Label>
                            <div className="flex gap-4 items-center">
                                <input
                                    id="tags"
                                    name="tags"
                                    type="text"
                                    placeholder="New tag"
                                    value={newTag}
                                    onChange={e => setNewTag(e.target.value)}
                                    className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                                />
                                <Button
                                    onClick={() => addTag(newTag)}
                                >
                                    Add tag
                                </Button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <AnimatePresence>
                                    {tagList.map(tag => (
                                        <motion.div
                                            key={tag.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Badge
                                                onClick={() => removeTag(tag.id)}
                                                className="cursor-pointer hover:brightness-95"
                                            >
                                                {tag.name}<X className="mt-0.5" />
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Due date */}
                        <div className="grid gap-3">
                            <Label htmlFor="dueDate">Change or add due date</Label>
                            <input
                                type="datetime-local"
                                id="dueDate"
                                name="dueDate"
                                value={dueDate ?? ""}
                                onChange={e => setDueDate(e.target.value)}
                                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                            />
                        </div>

                        <Button onClick={() => deleteTodo.mutate(todo.id)} variant={"destructive"}>Delete task <Trash /></Button>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <button type="button" className="px-4 py-2 rounded border">
                                Cancel
                            </button>
                        </DialogClose>
                        <button
                            type="button"
                            onClick={handleUpdate}
                            disabled={updateTodo.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {updateTodo.isPending ? "Updating..." : "Update task"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}