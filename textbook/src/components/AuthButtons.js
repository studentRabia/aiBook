import React, { useState, useEffect } from 'react';
import styles from './AuthButtons.module.css';

export default function AuthButtons() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/get-session', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.session) {
          setUser(data.session.user);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
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
            <a href="/profile" className={styles.dropdownItem}>
              Profile Settings
            </a>
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
