import { badgeTracker } from '../utils/badgeTracker.js';

const API_URL = "http://localhost:5000";

/**
 * Fetch badges from backend and initialize badgeTracker
 * @param {number} userId - The user's ID
 */
async function fetchAndInitializeBadges(userId) {
  try {
    const response = await fetch(`${API_URL}/auth/badges/${userId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.warn('Failed to fetch badges on login');
      return;
    }

    const data = await response.json();
    
    if (data.success && data.badges) {
      // Store badges in localStorage
      localStorage.setItem('earned_badges', JSON.stringify(data.badges));
      
      // Initialize badgeTracker with fetched data
      badgeTracker.initialize({ badges: data.badges });
    }
  } catch (err) {
    console.error('Error fetching badges on login:', err);
    // Don't throw - badge sync failure shouldn't block login
  }
}

export async function signup(name, email, password, city) {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, city }),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(
        `Server error: ${response.status}. ${text.substring(0, 100)}`
      );
    }

    if (!response.ok) {
      throw new Error(data.error || "Signup failed");
    }

    return data;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error(
      err.message || "Signup failed. Check if the backend is running."
    );
  }
}

export async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(
        `Server error: ${response.status}. ${text.substring(0, 100)}`
      );
    }

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    if (data.success && data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Fetch badges on login
      await fetchAndInitializeBadges(data.user.id);
    }

    return data;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error(
      err.message || "Login failed. Check if the backend is running."
    );
  }
}

export async function logout() {
  try {
    // Sync badges to Supabase before logout
    await badgeTracker.syncToSupabase();
    
    // Clear badge data
    badgeTracker.clear();
    
    // Clear user data
    localStorage.removeItem("user");
  } catch (err) {
    console.error('Error during logout:', err);
    // Even if sync fails, still clear local data
    badgeTracker.clear();
    localStorage.removeItem("user");
  }
}

export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}
