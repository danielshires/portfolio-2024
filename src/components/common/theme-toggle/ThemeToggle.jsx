import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme');
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

export default function ThemeToggle() {
    const [theme, setTheme] = useState(getInitialTheme());

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <button
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
        >
            {theme === 'dark' ? <FiSun size={20} className="text-gray-700 dark:text-gray-300" /> : <FiMoon className="text-gray-700 dark:text-gray-300" size={20} />}
        </button>
    );
}
