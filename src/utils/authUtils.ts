// src/utils/authUtils.ts

export const clearAuthData = () => {
    localStorage.removeItem('spotifyAuthData');
    // Clear any other auth-related data you might be storing
};