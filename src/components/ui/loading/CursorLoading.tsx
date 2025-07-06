import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Props for the CursorLoading component
 */
interface CursorLoadingProps {
  onComplete?: () => void; // Callback when loading animation completes
  className?: string;      // Additional CSS classes
}

/**
 * CursorLoading Component
 *
 * A smooth loading animation that shows design workflow activities with a progress bar.
 * Only displays on the first page visit, then triggers a swipe-up page reveal animation.
 *
 * Animation Timeline (4 seconds total):
 * - 0.0s: Progress bar starts moving (0% → 100%)
 * - 0.3s: "Drawing vectors" fades up from below
 * - 1.5s: "Coding interface" fades up from below
 * - 2.7s: "Perfecting details" fades up from below
 * - 3.9s: "Let's go!" appears
 * - 4.0s: Loading screen swipes up, page content slides up from below
 */
const CursorLoading: React.FC<CursorLoadingProps> = ({ onComplete, className = '' }) => {
  // DOM element references for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null); // Main loading screen container
  const progressRef = useRef<HTMLDivElement>(null);  // Progress bar element
  const textRef = useRef<HTMLDivElement>(null);      // Activity text element

  // Design workflow activities shown during loading (3 states)
  const designActivities = [
    'Drawing vectors',    // 0.3s - 1.5s
    'Coding interface',   // 1.5s - 2.7s
    'Perfecting details', // 2.7s - 3.9s
  ];

  useEffect(() => {
    // Exit early if container ref is not available
    if (!containerRef.current) return;

    // Get DOM elements for GSAP animations
    const container = containerRef.current;
    const progress = progressRef.current;
    const text = textRef.current;

    /**
     * Create main GSAP timeline
     * Controls the entire loading sequence and cleanup
     */
    const tl = gsap.timeline({
      onComplete: () => {
        // 1. Dispatch custom event to trigger coordinated page reveal animation
        // This tells Layout.astro to start sliding the page content up from below
        window.dispatchEvent(new CustomEvent('loadingComplete'));

        // 2. Swipe up animation - slide the loading screen up and off screen
        gsap.to(container, {
          y: "-100%",        // Move completely off screen upward
          duration: 0.8,     // 800ms smooth transition
          ease: "power2.inOut", // Smooth acceleration/deceleration
          onComplete: () => {
            // 3. Call the onComplete callback to hide the component
            if (onComplete) onComplete();
          }
        });
      }
    });

    /**
     * Initial setup - Set starting positions for all elements
     */
    gsap.set(container, { opacity: 1 });      // Loading screen visible
    gsap.set(progress, { width: "0%" });      // Progress bar starts empty
    gsap.set(text, { opacity: 0, y: 15 });    // Text starts invisible, 15px below final position

    // Clear any initial text content (prevents "Loading..." flash)
    if (text) {
      text.innerHTML = '';
    }

    /**
     * Progress Bar Animation
     * Smoothly fills from 0% to 100% over the entire duration
     */
    const totalDuration = 4.0; // Total animation duration in seconds
    tl.to(progress, {
      width: "100%",         // Fill completely
      duration: totalDuration, // Takes full 4 seconds
      ease: "power1.out"     // Slower at the end (more thoughtful feeling)
    }, 0); // Start immediately at timeline position 0

    /**
     * Text Activity Animations
     * Each activity fades up from below, stays visible, then fades out upward
     */
    designActivities.forEach((activity, index) => {
      const baseTime = 0.4 + (index * 1.2); // Start times: 0.4s, 1.6s, 2.8s

      tl.set(text, {
          innerHTML: activity, // Set the text content
          y: 15                // Position 15px below final position
        }, baseTime)
        .to(text, {
          opacity: 1,          // Fade in
          y: 0,               // Move to final position
          duration: 0.5,      // 500ms fade-in
          ease: "power2.out"  // Smooth deceleration
        }, baseTime)
        .to(text, {
          opacity: 0,         // Fade out
          y: -8,             // Move slightly upward
          duration: 0.4,     // 400ms fade-out
          ease: "power1.in"  // Smooth acceleration
        }, baseTime + 0.8); // Start fade-out 800ms after fade-in
    });

    /**
     * Final "Let's go!" Animation
     * Appears at the end and stays visible until swipe-up begins
     */
    const finalTime = 0.3 + (designActivities.length * 1.2); // 3.9s
    tl.set(text, {
        innerHTML: "Let's go!",
        y: 15
      }, finalTime)
      .to(text, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      }, finalTime);

    /**
     * Cleanup function
     * Kills the GSAP timeline when component unmounts
     */
    return () => {
      tl.kill();
    };
  }, [onComplete]); // Re-run effect if onComplete callback changes

  /**
   * Render the loading screen UI
   */
  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 ${className}`}
    >
      <div className="flex flex-col items-center space-y-8">
        {/* Progress Bar Container */}
        <div className="w-48 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          {/* Animated Progress Bar Fill */}
          <div
            ref={progressRef}
            className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full"
          />
        </div>

        {/* Activity Text Display */}
        {/* Uses overline styling: small, uppercase, monospace, tracked */}
        <div
          ref={textRef}
          className="text-xs font-normal uppercase tracking-wider font-mono text-zinc-600 dark:text-zinc-400 h-6 flex items-center justify-center"
        >
          {/* No initial text content - will be dynamically set by GSAP animations */}
        </div>
      </div>
    </div>
  );
};

export default CursorLoading;
