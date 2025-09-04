'use client'

import { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useTodos } from "@/hooks/useTodo";
import { Tags } from "lucide-react";

interface CreateTodoProps {
    search: string,
}

export function CreateTodo({ search }: CreateTodoProps) {
    const [newTitle, setNewTitle] = useState("");
    const [newTags, setNewTags] = useState("");

    const { addTodo } = useTodos(search);

    const handleAdd = () => {
        const tagsArray = newTags
            .split(",")
            .map(t => t.trim())
            .filter(t => t.length > 0);

        addTodo.mutate({ title: newTitle, tags: tagsArray });
    };
    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>

                    <Button className="w-full">
                        <Tags className="w-4 h-4 mr-2" />
                        Add New Todo
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add task</DialogTitle>
                        <DialogDescription>
                            Create a new task. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
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

                        {/* Description */}
                        {/* <div className="grid gap-3">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={3}
                                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                                placeholder="Add details about the task..."
                            />
                        </div> */}

                        {/* Due date */}
                        <div className="grid gap-3">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <input
                                type="datetime-local"
                                id="dueDate"
                                name="dueDate"
                                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
                            />
                        </div>

                        {/* Tags */}
                        <div className="grid gap-3">
                            <Label htmlFor="tags">Tags</Label>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a tag" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Fruits</SelectLabel>
                                        <SelectItem value="apple">Apple</SelectItem>
                                        <SelectItem value="banana">Banana</SelectItem>
                                        <SelectItem value="blueberry">Blueberry</SelectItem>
                                        <SelectItem value="grapes">Grapes</SelectItem>
                                        <SelectItem value="pineapple">Pineapple</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <button type="button" className="px-4 py-2 rounded border">
                                Cancel
                            </button>
                        </DialogClose>
                        <button
                            type="submit"
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
