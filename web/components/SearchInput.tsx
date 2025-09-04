"use client";

import React, { useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

interface SearchInputProps {
    value: string;
    onSearchChange: (searchTerm: string) => void;
}

export function SearchInput({ value, onSearchChange }: SearchInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Maintain focus on this input
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
                ref={inputRef}
                placeholder="Search todos..."
                value={value}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 bg-background/50 border-border/50 focus:bg-background"
            />
        </div>

    );
}