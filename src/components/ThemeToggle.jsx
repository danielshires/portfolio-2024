import { FiSun, FiMoon } from 'react-icons/fi';
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        // Initialize theme
        const root = document.documentElement
        const savedTheme = localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            root.classList.add('dark')
            setIsDark(true)
        } else {
            root.classList.remove('dark')
            setIsDark(false)
        }
    }, [])

    const handleClick = () => {
        const root = document.documentElement
        const newIsDark = !isDark

        // Update theme
        if (newIsDark) {
            root.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            root.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }

        // Update state
        setIsDark(newIsDark)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="p-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors theme-transition"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                <FiSun
                    className={`absolute w-5 h-5 transition-all duration-300 ease-in-out ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                    style={{ color: isDark ? '#fafafa' : '#09090b' }}
                />
                <FiMoon
                    className={`absolute w-5 h-5 transition-all duration-300 ease-in-out ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`}
                    style={{ color: isDark ? '#fafafa' : '#09090b' }}
                />
            </div>
        </button>
    )
}
