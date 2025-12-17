import React, { useState, useEffect } from 'react';
import styles from './PersonalizeButton.module.css';

export default function PersonalizeButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const { authClient } = await import('../lib/auth-client');
      const session = await authClient.getSession();
      setIsLoggedIn(!!session?.user);
      if (session?.user) {
        setUserProfile(session.user);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const extractChapterContent = () => {
    const articleElement = document.querySelector('article.markdown');
    if (!articleElement) return null;

    // Clone to avoid modifying original
    const clone = articleElement.cloneNode(true);

    // Remove the personalize/translate button containers from content
    clone
      .querySelectorAll(
        '[class*="personalizeContainer"], [class*="translateContainer"]'
      )
      .forEach((el) => el.remove());

    return clone.innerHTML;
  };

  const getChapterTitle = () => {
    const titleElement = document.querySelector('article.markdown h1');
    return titleElement?.textContent || 'Chapter';
  };

  const handlePersonalize = async () => {
    if (!isLoggedIn) {
      alert('Please sign in to use content personalization.');
      window.location.href = '/signin';
      return;
    }

    setIsLoading(true);

    try {
      const articleElement = document.querySelector('article.markdown');

      if (!articleElement) {
        setIsLoading(false);
        return;
      }

      if (!isPersonalized) {
        // Save original content
        setOriginalContent(articleElement.innerHTML);

        const content = extractChapterContent();
        const chapterTitle = getChapterTitle();

        const response = await fetch('/api/personalize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            userProfile,
            chapterTitle,
          }),
        });

        if (!response.ok) {
          throw new Error('Personalization failed');
        }

        const { personalizedContent } = await response.json();

        // Find the buttons to preserve them
        const buttons = articleElement.querySelectorAll(
          '[class*="personalizeContainer"], [class*="translateContainer"]'
        );
        const buttonHTML = Array.from(buttons)
          .map((b) => b.outerHTML)
          .join('');

        // Replace content but keep buttons
        articleElement.innerHTML = buttonHTML + personalizedContent;

        articleElement.classList.add('personalized-content');
        setIsPersonalized(true);
      } else {
        // Restore original content
        if (originalContent) {
          articleElement.innerHTML = originalContent;
          articleElement.classList.remove('personalized-content');
        }
        setIsPersonalized(false);
      }
    } catch (error) {
      console.error('Personalization failed:', error);
      alert('Personalization failed. Please try again.');
    }

    setIsLoading(false);
  };

  // Don't render on non-doc pages
  if (
    typeof window !== 'undefined' &&
    !window.location.pathname.includes('/docs/')
  ) {
    return null;
  }

  const levelLabel = userProfile?.personalizedLevel
    ? userProfile.personalizedLevel.charAt(0).toUpperCase() +
      userProfile.personalizedLevel.slice(1)
    : '';

  return (
    <div className={styles.personalizeContainer}>
      <button
        className={`${styles.personalizeButton} ${isPersonalized ? styles.active : ''}`}
        onClick={handlePersonalize}
        disabled={isLoading}
        title={
          isLoggedIn
            ? isPersonalized
              ? 'Switch to Original'
              : `Personalize for ${levelLabel} level`
            : 'Sign in to personalize'
        }
      >
        {isLoading ? (
          <span className={styles.spinner}></span>
        ) : (
          <>
            <span className={styles.icon}>{isPersonalized ? '📖' : '✨'}</span>
            <span className={styles.text}>
              {isPersonalized ? 'View Original' : 'Personalize for Me'}
            </span>
          </>
        )}
      </button>
      {!isLoggedIn && (
        <span className={styles.loginHint}>
          <a href="/signin">Sign in</a> to personalize content
        </span>
      )}
      {isLoggedIn && !isPersonalized && (
        <span className={styles.levelBadge}>Level: {levelLabel}</span>
      )}
    </div>
  );
}
