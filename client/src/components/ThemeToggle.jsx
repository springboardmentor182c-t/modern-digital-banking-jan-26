import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

export function ThemeToggle({ className }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                className
            )}
            aria-label="Toggle theme"
        >
            <Sun className={cn(
                "h-[1.2rem] w-[1.2rem] transition-all transform duration-300",
                theme === 'dark' ? "scale-0 rotate-90" : "scale-100 rotate-0"
            )} />
            <Moon className={cn(
                "absolute h-[1.2rem] w-[1.2rem] transition-all transform duration-300",
                theme === 'dark' ? "scale-100 rotate-0" : "scale-0 -rotate-90"
            )} />
        </button>
    );
}
