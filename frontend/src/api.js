/**
 * @file api.js
 * @description Centralized API configuration and wrapper utilizing environment-based base URLs and credential inclusion.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Wrapper around the native fetch API to automatically prepend the base URL
 * and include credentials (cookies, headers) with requests.
 * 
 * @param {string} path - The endpoint path (e.g., '/api/v1/auth/login').
 * @param {RequestInit} [options={}] - Additional fetch options (method, headers, body, etc.).
 * @returns {Promise<Response>} The fetch response promise.
 */
export const apiFetch = (path, options = {}) => {
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
  });
};