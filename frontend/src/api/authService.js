const API_URL = "http://localhost:5000";

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
    }

    return data;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error(
      err.message || "Login failed. Check if the backend is running."
    );
  }
}

export function logout() {
  localStorage.removeItem("user");
}

export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}
