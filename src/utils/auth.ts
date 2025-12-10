export const getAuthData = () => {
  try {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      return null;
    }
    
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

export const saveAuthData = (token: string, userData: any) => {
  try {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    // Set token expiry (24 hours from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);
    localStorage.setItem('tokenExpiry', expiryDate.toISOString());
    return true;
  } catch (error) {
    console.error('Error saving auth data:', error);
    return false;
  }
};

export const clearAuthData = () => {
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tokenExpiry');
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    clearAuthData();
    return false;
  }

  const expiryDate = localStorage.getItem('tokenExpiry');
  if (expiryDate) {
    const isTokenValid = new Date(expiryDate) > new Date();
    if (!isTokenValid) {
      clearAuthData();
      return false;
    }
  }

  return true;
};
