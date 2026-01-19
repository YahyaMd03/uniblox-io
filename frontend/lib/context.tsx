'use client';

/**
 * User context for managing userId across the application
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserContextType {
  userId: string;
  setUserId: (userId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string>('');

  // Load userId from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('userId');
    if (saved) {
      setUserIdState(saved);
    } else {
      // Default to a random userId if none exists
      const defaultUserId = `user-${Math.random().toString(36).substr(2, 9)}`;
      setUserIdState(defaultUserId);
      localStorage.setItem('userId', defaultUserId);
    }
  }, []);

  const setUserId = (newUserId: string) => {
    setUserIdState(newUserId);
    localStorage.setItem('userId', newUserId);
  };

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
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
