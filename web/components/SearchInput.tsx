"use client";

import React, { useEffect, useRef } from "react";

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
        <input
            ref={inputRef}
            type="text"
            placeholder="Search todos..."
            value={value}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
        />
    );
}