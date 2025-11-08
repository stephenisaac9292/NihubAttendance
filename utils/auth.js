/**
 * Authentication utility functions
 */

// Store token and user data
export const setAuth = (token, user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  };
  
  // Get token
  export const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };
  
  // Get user data
  export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');

    // prevent parsing when value is `"undefined"` or empty
    if (!user || user === "undefined") return null;

    return JSON.parse(user);
  }
  return null;
};
  
  // Check if user is authenticated
  export const isAuthenticated = () => {
    return !!getToken();
  };
  
  // Check if user is superadmin
  export const isSuperAdmin = () => {
    const user = getUser();
    return user?.role === 'superadmin';
  };
  
  // Check if user is admin
  export const isAdmin = () => {
    const user = getUser();
    return user?.role === 'admin' || user?.role === 'superadmin';
  };
  
  // Logout
  export const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };
  
  // Get auth headers for axios
  export const getAuthHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };