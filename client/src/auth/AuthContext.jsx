import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { decode } from 'jwt-decode';

// Action types
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';

// Reducer function to manage authentication state
const authReducer = (state, action) => {
  switch (action.type) {
    case LOGIN:
      return { ...state, token: action.token, user: decode(action.token) };
    case LOGOUT:
      return { ...state, token: null, user: null };
    default:
      return state;
  }
};

// Initial state for the reducer
const initialState = {
  token: localStorage.getItem("token"),
  user: null,
};

// Create the AuthContext
export const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      const decoded = decode(state.token);
      const isExpired = decoded.exp * 1000 < Date.now();  // Check if the token is expired

      if (isExpired) {
        logout();  // Log the user out if token is expired
      }
    }
  }, [state.token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    dispatch({ type: LOGIN, token: newToken });
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: LOGOUT });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
