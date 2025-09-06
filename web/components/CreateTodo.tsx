'use client'

import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useTodos } from "@/hooks/useTodo";
import { Tags, X } from "lucide-react";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface CreateTodoProps {
    search: string,
}

interface Tag {
    id: string;
    name: string;
}

export function CreateTodo({ search }: CreateTodoProps) {
    const [newTitle, setNewTitle] = useState("");
    const [newTag, setNewTag] = useState("");
    const [tagList, setTagList] = useState<Tag[]>([]);
    const [dueDate, setDueDate] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const addTag = (name: string) => {
        if (!name) return;
        const newTag = { id: crypto.randomUUID(), name };
        setTagList([...tagList, newTag]);
        setNewTag("");
    };

    const removeTag = (id: string) => {
        setTagList(tagList.filter(tag => tag.id !== id));
    };

    const { addTodo } = useTodos(search);

    const handleAdd = async () => {
        console.log(dueDate)
        if (!newTitle) return;
        await addTodo.mutateAsync({
            title: newTitle,
            tags: tagList.map(tag => tag.name),
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        });
        setNewTitle("");
        setTagList([]);
        setDueDate(null);
        setOpen(false);
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
                <DialogTrigger asChild>
                    <Button className="w-full">
                        <Tags className="w-4 h-4 mr-2" />
                        Add New Todo
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add task</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6">
                        {/* Task name */}
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
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
                            <Label htmlFor="tags">Add tags</Label>
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
                            <Label htmlFor="dueDate">Due Date</Label>
                            <input
                                type="datetime-local"
                                id="dueDate"
                                name="dueDate"
                                value={dueDate ?? ""}
                                onChange={e => setDueDate(e.target.value)}
                                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <button type="button" className="px-4 py-2 rounded border">
                                Cancel
                            </button>
                        </DialogClose>
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={addTodo.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            {addTodo.isPending ? "Adding..." : "Add task"}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
