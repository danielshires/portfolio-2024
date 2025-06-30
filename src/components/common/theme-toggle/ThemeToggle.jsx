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

const applyTheme = (theme) => {
    if (typeof window === 'undefined') return;
    
    // Update class on document element
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // Update background colors immediately
    const color = theme === 'dark' ? 'rgb(9, 9, 11)' : 'rgb(250, 250, 250)';
    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
};

export default function ThemeToggle() {
    const [theme, setTheme] = useState(getInitialTheme());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Listen for external theme changes (like from other components or page loads)
    useEffect(() => {
        const handleStorageChange = () => {
            const newTheme = localStorage.getItem('theme') || getInitialTheme();
            if (newTheme !== theme) {
                setTheme(newTheme);
            }
        };

        // Listen for storage changes from other tabs
        window.addEventListener('storage', handleStorageChange);
        
        // Listen for Swup transitions and recheck theme
        const handleSwupTransition = () => {
            const currentTheme = localStorage.getItem('theme') || getInitialTheme();
            setTheme(currentTheme);
            applyTheme(currentTheme);
        };
        
        document.addEventListener('swup:pageView', handleSwupTransition);
        document.addEventListener('swup:contentReplaced', handleSwupTransition);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            document.removeEventListener('swup:pageView', handleSwupTransition);
            document.removeEventListener('swup:contentReplaced', handleSwupTransition);
        };
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
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
