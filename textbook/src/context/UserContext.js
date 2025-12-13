import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const signOut = async () => {
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

  const getPersonalizedLevel = () => {
    if (!user) return 'beginner';
    return user.personalizedLevel || 'beginner';
  };

  const getUserBackground = () => {
    if (!user) return null;

    return {
      programmingExperience: user.programmingExperience,
      programmingLanguages: user.programmingLanguages
        ? JSON.parse(user.programmingLanguages)
        : [],
      softwareBackground: user.softwareBackground,
      hardwareExperience: user.hardwareExperience,
      roboticsExperience: user.roboticsExperience,
      hardwarePlatforms: user.hardwarePlatforms
        ? JSON.parse(user.hardwarePlatforms)
        : [],
      learningGoals: user.learningGoals
        ? JSON.parse(user.learningGoals)
        : [],
    };
  };

  const value = {
    user,
    loading,
    signOut,
    getPersonalizedLevel,
    getUserBackground,
    isAuthenticated: !!user,
    refreshSession: checkSession,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
