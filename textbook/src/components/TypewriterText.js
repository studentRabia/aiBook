/**
 * TypewriterText Component
 *
 * A high-end typewriter animation component for the robotics textbook.
 * Features:
 * - Smooth letter-by-letter animation
 * - Linear gradient color effect (blue → purple → cyan)
 * - First-visit-only animation (uses sessionStorage)
 * - Professional, academic-tech aesthetic
 *
 * @author AI Teaching Assistant
 */

import React, { useState, useEffect, useRef } from 'react';
import styles from './TypewriterText.module.css';

/**
 * TypewriterText - Renders text with a typewriter animation effect
 *
 * @param {Object} props
 * @param {string} props.text - The text to animate
 * @param {number} props.speed - Typing speed in ms per character (default: 80)
 * @param {number} props.initialDelay - Delay before animation starts in ms (default: 500)
 * @param {boolean} props.showCursor - Whether to show blinking cursor (default: true)
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onComplete - Callback when animation completes
 */
export default function TypewriterText({
  text,
  speed = 80,
  initialDelay = 500,
  showCursor = true,
  className = '',
  onComplete = () => {},
}) {
  // State for the currently displayed text
  const [displayedText, setDisplayedText] = useState('');
  // State to track if animation is complete
  const [isComplete, setIsComplete] = useState(false);
  // State to track if animation should play
  const [shouldAnimate, setShouldAnimate] = useState(true);
  // Ref for cleanup
  const timeoutRef = useRef(null);
  const indexRef = useRef(0);

  // Storage key for tracking first visit
  const STORAGE_KEY = 'typewriter_animation_played';

  useEffect(() => {
    // Check if animation has already played this session
    const hasPlayed = sessionStorage.getItem(STORAGE_KEY);

    if (hasPlayed) {
      // Skip animation, show full text immediately
      setDisplayedText(text);
      setIsComplete(true);
      setShouldAnimate(false);
      return;
    }

    // Mark animation as played for this session
    sessionStorage.setItem(STORAGE_KEY, 'true');

    // Start animation after initial delay
    const startTimeout = setTimeout(() => {
      animateText();
    }, initialDelay);

    return () => {
      clearTimeout(startTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text]);

  /**
   * Animates the text character by character
   * Uses recursive setTimeout for smooth, non-blocking animation
   */
  const animateText = () => {
    if (indexRef.current < text.length) {
      // Add next character
      setDisplayedText(text.slice(0, indexRef.current + 1));
      indexRef.current += 1;

      // Calculate variable speed for natural feel
      // Slight pause after punctuation, faster for spaces
      const char = text[indexRef.current - 1];
      let charSpeed = speed;

      if (['.', '!', '?', ':'].includes(char)) {
        charSpeed = speed * 3; // Longer pause after punctuation
      } else if (char === ',') {
        charSpeed = speed * 1.5; // Medium pause after comma
      } else if (char === ' ') {
        charSpeed = speed * 0.5; // Faster through spaces
      } else if (char === '&') {
        charSpeed = speed * 2; // Pause on ampersand for emphasis
      }

      // Schedule next character
      timeoutRef.current = setTimeout(animateText, charSpeed);
    } else {
      // Animation complete
      setIsComplete(true);
      onComplete();
    }
  };

  return (
    <span
      className={`${styles.typewriterContainer} ${className}`}
      aria-label={text}
    >
      {/* Gradient text container */}
      <span className={styles.gradientText}>
        {displayedText}
      </span>

      {/* Blinking cursor */}
      {showCursor && !isComplete && shouldAnimate && (
        <span className={styles.cursor} aria-hidden="true">|</span>
      )}

      {/* Subtle glow effect on completion */}
      {isComplete && (
        <span className={styles.glowOverlay} aria-hidden="true" />
      )}
    </span>
  );
}
