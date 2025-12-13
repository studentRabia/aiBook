// Client-side auth utilities
// For production, connect this to your Better Auth backend

const STORAGE_KEY = 'robotics_textbook_user';

export const authClient = {
  // Sign up a new user
  signUp: async ({ name, email, password, ...profile }) => {
    // In production, this would call your Better Auth API
    // For now, we'll store locally for demo purposes

    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      ...profile,
      createdAt: new Date().toISOString(),
    };

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('robotics_users') || '[]');
    if (existingUsers.find(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }

    // Store user
    existingUsers.push({ ...user, password: btoa(password) });
    localStorage.setItem('robotics_users', JSON.stringify(existingUsers));

    // Set session
    const session = { user, expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    return { user, session };
  },

  // Sign in existing user
  signIn: async ({ email, password, rememberMe = true }) => {
    const existingUsers = JSON.parse(localStorage.getItem('robotics_users') || '[]');
    const user = existingUsers.find(u => u.email === email && u.password === btoa(password));

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPassword } = user;
    const expiresIn = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const session = { user: userWithoutPassword, expiresAt: Date.now() + expiresIn };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    return { user: userWithoutPassword, session };
  },

  // Sign out
  signOut: async () => {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  },

  // Get current session
  getSession: async () => {
    try {
      const sessionData = localStorage.getItem(STORAGE_KEY);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData);

      // Check if session expired
      if (session.expiresAt && Date.now() > session.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    const session = await authClient.getSession();
    if (!session) throw new Error('Not authenticated');

    // Update in users list
    const existingUsers = JSON.parse(localStorage.getItem('robotics_users') || '[]');
    const userIndex = existingUsers.findIndex(u => u.id === session.user.id);

    if (userIndex >= 0) {
      existingUsers[userIndex] = { ...existingUsers[userIndex], ...updates };
      localStorage.setItem('robotics_users', JSON.stringify(existingUsers));
    }

    // Update session
    const updatedUser = { ...session.user, ...updates };
    session.user = updatedUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

    return { user: updatedUser };
  },
};

// React hook for session
export const useSession = () => {
  const [session, setSession] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkSession = async () => {
      const sess = await authClient.getSession();
      setSession(sess);
      setLoading(false);
    };
    checkSession();

    // Listen for storage changes (multi-tab sync)
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        checkSession();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { data: session, isPending: loading };
};

// Make React available for the hook
import React from 'react';

export default authClient;
