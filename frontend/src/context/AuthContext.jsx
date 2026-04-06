import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosInstance';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  user: null,          // Full user object from DB
  token: null,         // JWT string
  isAuthenticated: false,
  isLoading: true,     // True while restoring session from localStorage
};

// ─── Action Types ─────────────────────────────────────────────────────────────
const AUTH_ACTIONS = {
  SET_LOADING:   'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT:        'LOGOUT',
  UPDATE_USER:   'UPDATE_USER',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, isLoading: false };

    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: action.payload };

    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Restore session from localStorage on mount ────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('todo_token');
      const storedUser = localStorage.getItem('todo_user');

      if (!token || !storedUser) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        // Verify token is still valid by calling /getuser
        const response = await apiClient.get('/auth/getuser', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: response.data.user, token },
          });
        } else {
          clearStorage();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } catch {
        // Token expired or invalid — clear session
        clearStorage();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    restoreSession();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const clearStorage = () => {
    localStorage.removeItem('todo_token');
    localStorage.removeItem('todo_user');
  };

  const persistSession = (token, user) => {
    localStorage.setItem('todo_token', token);
    localStorage.setItem('todo_user', JSON.stringify(user));
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Register a new user and log them in automatically
   */
  const register = useCallback(async (formData) => {
    const response = await apiClient.post('/auth/register', formData);
    const { token, user } = response.data;
    persistSession(token, user);
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { token, user } });
    return response.data;
  }, []);

  /**
   * Login with email & password
   */
  const login = useCallback(async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    persistSession(token, user);
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { token, user } });
    return response.data;
  }, []);

  /**
   * Update current user profile fields
   */
  const updateUser = useCallback(async (updates) => {
    const response = await apiClient.patch('/auth/updateuser', updates, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const updatedUser = response.data.user;
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: updatedUser });
    localStorage.setItem('todo_user', JSON.stringify(updatedUser));
    return response.data;
  }, [state.token]);

  /**
   * Log out — clears both frontend and backend session state
   */
  const logout = useCallback(() => {
    clearStorage();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const value = {
    ...state,
    register,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
