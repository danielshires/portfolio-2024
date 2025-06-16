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

        // Add script to handle theme toggle
        const script = document.createElement('script')
        script.textContent = `
            function toggleTheme() {
                const root = document.documentElement
                const isDark = root.classList.contains('dark')

                if (isDark) {
                    root.classList.remove('dark')
                    localStorage.setItem('theme', 'light')
                } else {
                    root.classList.add('dark')
                    localStorage.setItem('theme', 'dark')
                }
            }
        `
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
        }
    }, [])

    const handleClick = () => {
        // Call the global toggle function
        window.toggleTheme()
        // Update React state
        setIsDark(!isDark)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
        >
            <div className="relative w-5 h-5">
                <FiSun
                    className={`absolute w-5 h-5 transition-all duration-300 ease-in-out ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                        }`}
                    style={{ color: isDark ? 'white' : 'black' }}
                />
                <FiMoon
                    className={`absolute w-5 h-5 transition-all duration-300 ease-in-out ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                        }`}
                    style={{ color: isDark ? 'white' : 'black' }}
                />
            </div>
        </button>
    )
}
