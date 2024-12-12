import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(JSON.parse(storedUser));  // Retrieve user from localStorage
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post(`http://localhost:5000/api/auth/login`, { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));  // Store user object in localStorage
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      setError(null);  // Clear any previous errors
    } catch (error) {
      setError('Invalid email or password');
      console.error(error); // Log the error for debugging
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');  // Remove user from localStorage
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
