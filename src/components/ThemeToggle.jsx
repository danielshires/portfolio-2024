import { FiSun, FiMoon } from 'react-icons/fi'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        // Initialize state based on localStorage or system preference
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme')
            if (savedTheme) {
                return savedTheme === 'dark'
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        }
        return false
    })

    useEffect(() => {
        // Apply initial theme
        if (isDark) {
            document.documentElement.classList.add('dark')
            document.documentElement.classList.remove('light')
        } else {
            document.documentElement.classList.add('light')
            document.documentElement.classList.remove('dark')
        }

        // Listen for changes in system preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
            if (!localStorage.getItem('theme')) {
                if (e.matches) {
                    setIsDark(true)
                    document.documentElement.classList.remove('light')
                    document.documentElement.classList.add('dark')
                } else {
                    setIsDark(false)
                    document.documentElement.classList.remove('dark')
                    document.documentElement.classList.add('light')
                }
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [isDark])

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark')
            document.documentElement.classList.add('light')
            localStorage.setItem('theme', 'light')
            setIsDark(false)
        } else {
            document.documentElement.classList.remove('light')
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
            setIsDark(true)
        }
    }

    return (
        <button
            id="theme-toggle"
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center border border-white/10 dark:border-black/10 transition-colors duration-300 ease-in-out hover:bg-white/20 dark:hover:bg-black/20"
        >
            <div className="relative w-5 h-5">
                <FiSun
                    className={`absolute inset-0 w-5 h-5 text-slate-900 dark:text-slate-100 transition-opacity duration-300 ease-in-out ${isDark ? 'opacity-0' : 'opacity-100'
                        }`}
                />
                <FiMoon
                    className={`absolute inset-0 w-5 h-5 text-slate-900 dark:text-slate-100 transition-opacity duration-300 ease-in-out ${isDark ? 'opacity-100' : 'opacity-0'
                        }`}
                />
            </div>
        </button>
    )
}
