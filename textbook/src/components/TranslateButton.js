import React, { useState, useEffect } from 'react';
import styles from './TranslateButton.module.css';

export default function TranslateButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const { authClient } = await import('../lib/auth-client');
      const session = await authClient.getSession();
      setIsLoggedIn(!!session?.user);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const translateToUrdu = async (text) => {
    // Using Google Translate API (free tier via unofficial endpoint)
    // For production, use official Google Cloud Translation API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ur&dt=t&q=${encodeURIComponent(text)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Extract translated text from response
      let translated = '';
      if (data && data[0]) {
        data[0].forEach(item => {
          if (item[0]) {
            translated += item[0];
          }
        });
      }
      return translated || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const handleTranslate = async () => {
    if (!isLoggedIn) {
      alert('Please sign in to use the translation feature.');
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

      if (!isTranslated) {
        // Save original content
        setOriginalContent(articleElement.innerHTML);

        // Get all text nodes that need translation
        const elementsToTranslate = articleElement.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, td, th, blockquote');

        for (const element of elementsToTranslate) {
          // Skip code blocks and their parents
          if (element.closest('pre') || element.closest('code')) continue;

          // Get direct text content (not nested elements)
          const childNodes = Array.from(element.childNodes);

          for (const node of childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              const translated = await translateToUrdu(node.textContent);
              node.textContent = translated;
            }
          }
        }

        // Add RTL direction for Urdu
        articleElement.style.direction = 'rtl';
        articleElement.style.textAlign = 'right';
        articleElement.classList.add('urdu-content');

        setIsTranslated(true);
      } else {
        // Restore original content
        if (originalContent) {
          articleElement.innerHTML = originalContent;
          articleElement.style.direction = 'ltr';
          articleElement.style.textAlign = 'left';
          articleElement.classList.remove('urdu-content');
        }
        setIsTranslated(false);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      alert('Translation failed. Please try again.');
    }

    setIsLoading(false);
  };

  // Don't render on non-doc pages
  if (typeof window !== 'undefined' && !window.location.pathname.includes('/docs/')) {
    return null;
  }

  return (
    <div className={styles.translateContainer}>
      <button
        className={`${styles.translateButton} ${isTranslated ? styles.active : ''}`}
        onClick={handleTranslate}
        disabled={isLoading}
        title={isLoggedIn ? (isTranslated ? 'Switch to English' : 'Translate to Urdu') : 'Sign in to translate'}
      >
        {isLoading ? (
          <span className={styles.spinner}></span>
        ) : (
          <>
            <span className={styles.icon}>
              {isTranslated ? '🇬🇧' : '🇵🇰'}
            </span>
            <span className={styles.text}>
              {isTranslated ? 'English' : 'اردو میں پڑھیں'}
            </span>
          </>
        )}
      </button>
      {!isLoggedIn && (
        <span className={styles.loginHint}>
          <a href="/signin">Sign in</a> to translate
        </span>
      )}
    </div>
  );
}
