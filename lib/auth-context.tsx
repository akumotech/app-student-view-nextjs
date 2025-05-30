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

  useEffect(() => {
    fetchUserOnMount();
  }, []);

  const fetchUserOnMount = async () => {
    setLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
      const response = await fetch(`${baseUrl}/users/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Uncomment if backend is on a different domain and needs cookies
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error fetching user on mount:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    setLoading(true);
    try {
      const url = makeUrl("login").toString();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, action: "login" }), // Assuming 'action' is needed by backend
        credentials: "include", // Uncomment if backend is on a different domain
      });

      if (!response.ok) {
        // Try to parse error, provide fallback
        const errorData = await response
          .json()
          .catch(() => ({ message: "Login request failed" }));
        return {
          success: false,
          message:
            errorData.message || `Login failed with status: ${response.status}`,
          error: errorData.detail || errorData.error || "Unknown login error",
          // data is implicitly undefined here, aligning with LoginResponse
        };
      }

      const data = (await response.json()) as LoginResponse;

      // After successful login, backend should have set HTTP-only cookie.
      // Now, fetch user data to confirm and populate state.
      // Or, if your backend login response includes user data, you can use that directly.
      if (data.success && data.data?.user) {
        setUser(data.data.user);
        setIsAuthenticated(true);
        setLoading(false); // User data received, loading complete
      } else if (data.success) {
        // If login was successful but no user data in response, fetch it.
        await fetchUserOnMount(); // This will set user, isAuthenticated, and loading states
      } else {
        // This case implies response.ok was true, but data.success from payload is false.
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return {
          success: false,
          message:
            data.message || "Login succeeded but payload indicates failure.",
          error: data.error,
          // data is implicitly undefined here, aligning with LoginResponse
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
        // data is implicitly undefined here, aligning with LoginResponse
      };
    }
    // setLoading(false) is handled in all branches or by fetchUserOnMount
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<SignUpResponse> => {
    // setLoading(true); // Optional: set loading state for signup
    try {
      const url = makeUrl("signup").toString();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, action: "signup" }), // Assuming 'action' is needed
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
          data: null, // For SignUpResponse, data can be null on error, as T is null
        };
      }
      // Assuming signup response is primarily for status, not immediate login.
      // If backend sends { success: true, data: null }, it will be cast to SignUpResponse.
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
        data: null, // For SignUpResponse, data can be null on error
      };
    } finally {
      // setLoading(false); // Optional: clear loading state for signup
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const url = makeUrl("logout").toString();
      await fetch(url, {
        method: "POST", // Or GET, as per your backend
        credentials: "include", // Important to send cookies for backend to clear
      });
    } catch (error) {
      console.error(
        "Error calling backend logout, proceeding with client-side cleanup:",
        error
      );
    } finally {
      // Always clear client-side session state
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      // HTTP-only cookie is managed by the browser based on backend response.
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

// Types remain largely the same, but LoginResponse payload might not need 'token'
// if it was only for localStorage. User type already had 'password' removed.

// Define a generic Backend API Response structure based on openapi.json
type BackendAPIResponse<T = unknown> = {
  // Default T to unknown, data can be T or undefined
  success: boolean; // Matches backend openapi.json
  message?: string | null;
  data?: T;
  error?: string | string[] | null; // Allow for varied error structures
};

// Specific type for the data field in a successful Login response
type LoginSuccessData = {
  user: User;
  // token field is removed as it's an HTTP-only cookie now
};

// For SignUp, the data type is null (or undefined on error)
// meaning a successful signup might return { success: true, data: null } or just { success: true }
type SignUpResponse = BackendAPIResponse<null>;

// For Login, data is LoginSuccessData (or undefined on error)
type LoginResponse = BackendAPIResponse<LoginSuccessData>;

export type {
  User,
  SignUpResponse,
  LoginResponse,
  LoginSuccessData,
  BackendAPIResponse,
};
