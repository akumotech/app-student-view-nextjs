"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import { makeUrl } from "./utils";

type User = {
  id?: number;
  email: string;
  name: string;
  role?: string;
  disabled?: boolean;
  wakatime_access_token_encrypted?: string | null;
  student_id?: number;
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  signup: (email: string, password: string, name: string) => Promise<SignUpResponse>;
  logout: () => Promise<void>;
  fetchUserOnMount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
  initialIsAuthenticated = false,
  skipInitialFetch = false,
}: {
  children: ReactNode;
  initialUser?: User | null;
  initialIsAuthenticated?: boolean;
  skipInitialFetch?: boolean;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(skipInitialFetch ? false : initialUser ? false : true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const fetchInProgress = useRef(false);

  useEffect(() => {
    if (!skipInitialFetch && !initialCheckComplete && !fetchInProgress.current) {
      fetchUserOnMount();
    }
  }, [skipInitialFetch, initialCheckComplete]);

  const fetchUserOnMount = async (retryCount = 0) => {
    // Prevent duplicate calls
    if (fetchInProgress.current) {
      console.log("fetchUserOnMount already in progress, skipping...");
      return;
    }

    fetchInProgress.current = true;
    setLoading(true);

    try {
      const url = makeUrl("usersMe");
      console.log(`Fetching user from: ${url} (attempt ${retryCount + 1})`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("User fetch response status:", response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log("User data fetched successfully:");
        setUser(userData);
        setIsAuthenticated(true);
      } else if (response.status === 401 || response.status === 403) {
        console.log("User not authenticated (401/403)");
        setUser(null);
        setIsAuthenticated(false);
      } else if (response.status === 307) {
        console.log("Received 307 redirect, retrying...");
        // Handle redirect by following it
        const location = response.headers.get("location");
        if (location) {
          const redirectResponse = await fetch(location, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (redirectResponse.ok) {
            const userData = await redirectResponse.json();
            console.log("User data fetched successfully after redirect:");
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            console.log("Redirect failed with status:", redirectResponse.status);
            if (redirectResponse.status === 401 || redirectResponse.status === 403) {
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } else {
          console.log("No location header in 307 response");
          // Retry once more for 307 without location
          if (retryCount < 1) {
            console.log("Retrying 307 response...");
            fetchInProgress.current = false;
            setTimeout(() => fetchUserOnMount(retryCount + 1), 1000);
            return;
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
        console.log("User fetch failed with unexpected status:", response.status);
        // For other status codes, retry once before giving up
        if (retryCount < 1) {
          console.log(`Retrying due to status ${response.status}...`);
          fetchInProgress.current = false;
          setTimeout(() => fetchUserOnMount(retryCount + 1), 1000);
          return;
        } else {
          console.log("Max retries reached, maintaining current auth state");
        }
      }
    } catch (error) {
      console.error("Error fetching user on mount:", error);
      // Retry once on network error
      if (retryCount < 1) {
        console.log("Retrying due to network error...");
        fetchInProgress.current = false;
        setTimeout(() => fetchUserOnMount(retryCount + 1), 1000);
        return;
      } else {
        console.log("Network error after retry - maintaining current auth state");
      }
    } finally {
      setLoading(false);
      setInitialCheckComplete(true);
      fetchInProgress.current = false;
    }
  };

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setLoading(true);
    try {
      const url = makeUrl("login");
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, action: "login" }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Login request failed" }));
        return {
          success: false,
          message: errorData.message || `Login failed with status: ${response.status}`,
          error: errorData.detail || errorData.error || "Unknown login error",
        };
      }

      const data = (await response.json()) as LoginResponse;

      if (data.success && data.data?.user) {
        setUser(data.data.user);
        setIsAuthenticated(true);
        setLoading(false);
      } else if (data.success) {
        await fetchUserOnMount();
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return {
          success: false,
          message: data.message || "Login succeeded but payload indicates failure.",
          error: data.error,
        };
      }
      return data;
    } catch (error) {
      console.error("Login error:", error);
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return {
        success: false,
        message: "Something went wrong during login.",
        error: error instanceof Error ? error.message : "Client-side login exception",
      };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<SignUpResponse> => {
    try {
      const url = makeUrl("signup");
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, action: "signup" }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Signup request failed" }));
        return {
          success: false,
          message: errorData.message || `Signup failed with status: ${response.status}`,
          error: errorData.detail || errorData.error || "Unknown signup error",
          data: null,
        };
      }
      return (await response.json()) as SignUpResponse;
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: "Something went wrong during signup.",
        error: error instanceof Error ? error.message : "Client-side signup exception",
        data: null,
      };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const url = makeUrl("logout");
      await fetch(url, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error calling backend logout, proceeding with client-side cleanup:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        signup,
        logout,
        fetchUserOnMount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

type BackendAPIResponse<T = unknown> = {
  success: boolean;
  message?: string | null;
  data?: T;
  error?: string | string[] | null;
};

type LoginSuccessData = {
  user: User;
};

type SignUpResponse = BackendAPIResponse<null>;

type LoginResponse = BackendAPIResponse<LoginSuccessData>;

export type { User, SignUpResponse, LoginResponse, LoginSuccessData, BackendAPIResponse };
