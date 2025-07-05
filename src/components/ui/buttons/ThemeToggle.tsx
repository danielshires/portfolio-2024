import React from 'react'
import Button from './Button.tsx'

const ThemeToggle: React.FC = () => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Remove focus after click to prevent focus ring from persisting
    event.currentTarget.blur()
  }

  return (
    <Button
      variant="icon"
      size="icon"
      className="group"
      aria-label="Toggle theme"
      data-theme-toggle
      onClick={handleClick}
    >
      {/* Sun Icon */}
      <svg 
        data-sun-icon 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="hidden dark:block transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110"
      >
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      {/* Moon Icon */}
      <svg 
        data-moon-icon 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="block dark:hidden transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    </Button>
  )
}

export default ThemeToggle