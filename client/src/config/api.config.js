/**
 * Central API Configuration
 * 
 * All API URLs are derived from the VITE_API_URL environment variable.
 * Set VITE_API_URL in your .env file:
 *   - Development: VITE_API_URL=http://localhost:5000
 *   - Production:  VITE_API_URL=https://api.puspender.in
 * 
 * Note: VITE_API_URL should be the base server URL (no /api suffix).
 */

// Base server URL (no trailing slash, no /api suffix)
const RAW_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BASE_URL = RAW_URL.replace(/\/+$/, '').replace(/\/api\/?$/, '');

/** Base server URL — use for Socket.IO and non-API requests */
export const API_SERVER_URL = BASE_URL;

/** API base URL — use for all REST API calls (axios baseURL) */
export const API_BASE_URL = `${BASE_URL}/api`;
