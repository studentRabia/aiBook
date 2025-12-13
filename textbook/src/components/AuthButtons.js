import React, { useState, useEffect } from 'react';
import styles from './AuthButtons.module.css';

export default function AuthButtons() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    checkSession();

    // Listen for storage changes (multi-tab sync)
    const handleStorage = () => checkSession();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const checkSession = async () => {
    try {
      const { authClient } = await import('../lib/auth-client');
      const session = await authClient.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { authClient } = await import('../lib/auth-client');
      await authClient.signOut();
      setUser(null);
      setDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const getLevelBadgeClass = () => {
    if (!user?.personalizedLevel) return styles.badgeBeginner;
    switch (user.personalizedLevel) {
      case 'advanced':
        return styles.badgeAdvanced;
      case 'intermediate':
        return styles.badgeIntermediate;
      default:
        return styles.badgeBeginner;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownOpen && !e.target.closest(`.${styles.userMenu}`)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  if (loading) {
    return <div className={styles.loading}>...</div>;
  }

  if (user) {
    return (
      <div className={styles.userMenu}>
        <button
          className={styles.userButton}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className={styles.avatar}>
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className={styles.userName}>{user.name}</span>
          <span className={`${styles.levelBadge} ${getLevelBadgeClass()}`}>
            {user.personalizedLevel || 'beginner'}
          </span>
        </button>

        {dropdownOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <div className={styles.dropdownDivider} />
            <a href="/docs/intro" className={styles.dropdownItem}>
              My Learning Path
            </a>
            <div className={styles.dropdownDivider} />
            <button onClick={handleSignOut} className={styles.dropdownItem}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.authButtons}>
      <a href="/signin" className={styles.signInButton}>
        Sign In
      </a>
      <a href="/signup" className={styles.signUpButton}>
        Sign Up
      </a>
    </div>
  );
}
