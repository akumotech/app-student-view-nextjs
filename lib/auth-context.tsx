"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { makeUrl } from "./utils";

type User = {
  id?: number;
  email: string;
  name: string;
  role?: string;
  disabled?: boolean;
  wakatime_access_token_encrypted?: string | null;
};

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  signup: (
    email: string,
    password: string,
    name: string
  ) => Promise<SignUpResponse>;
  logout: () => Promise<void>;
  fetchUserOnMount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  useEffect(() => {
    if (!initialCheckComplete) {
      fetchUserOnMount();
    }
  }, [initialCheckComplete]);

  const fetchUserOnMount = async () => {
    setLoading(true);
    try {
      const url = makeUrl("usersMe");
      console.log("Fetching user from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("User data fetched successfully:", userData);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        console.log("User fetch failed with status:", response.status);
        if (response.status === 401 || response.status === 403) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("Error fetching user on mount:", error);
      console.log("Network error - maintaining current auth state");
    } finally {
      setLoading(false);
      setInitialCheckComplete(true);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
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
        const errorData = await response
          .json()
          .catch(() => ({ message: "Login request failed" }));
        return {
          success: false,
          message:
            errorData.message || `Login failed with status: ${response.status}`,
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
          message:
            data.message || "Login succeeded but payload indicates failure.",
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
        error:
          error instanceof Error
            ? error.message
            : "Client-side login exception",
      };
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<SignUpResponse> => {
    try {
      const url = makeUrl("signup");
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, action: "signup" }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Signup request failed" }));
        return {
          success: false,
          message:
            errorData.message ||
            `Signup failed with status: ${response.status}`,
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
        error:
          error instanceof Error
            ? error.message
            : "Client-side signup exception",
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
      console.error(
        "Error calling backend logout, proceeding with client-side cleanup:",
        error
      );
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

export type {
  User,
  SignUpResponse,
  LoginResponse,
  LoginSuccessData,
  BackendAPIResponse,
};
