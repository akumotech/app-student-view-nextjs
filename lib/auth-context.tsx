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
  disabled?: boolean;
  password: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");
    if (token) {
      setIsAuthenticated(true);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setLoading(false);
        return;
      }
      // Fetch user info if not in localStorage
      fetchUserFromApi(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserFromApi = async (token: string) => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
      const response = await fetch(`${baseUrl}/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.log("error occured: ", error);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {
    try {
      const url = makeUrl("login").toString();
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, action: "login" }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.ok === false) {
          return error;
        }
        throw new Error(error.error);
      }

      const data = (await response.json()) as LoginResponse;
      localStorage.setItem("authToken", data.payload?.token || "");
      if (data.payload?.user) {
        setUser(data.payload.user);
        localStorage.setItem("user", JSON.stringify(data.payload.user));
      }
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        message: "Something went wrong",
        error: "Login failed",
      };
    }
  };

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<SignUpResponse> => {
    try {
      const url = makeUrl("signup").toString();
      console.log(url);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, action: "signup" }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.log(error);
        if (error.ok === false) {
          return error;
        }
        throw new Error(error.error);
      }

      const data = (await response.json()) as SignUpResponse;
      return data;
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        message: "Something went wrong",
        error: "Signup failed",
      };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, loading, login, signup, logout }}
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

type SignUpResponse = {
  ok: boolean;
  message: string;
  error?: string | string[];
};

type LoginResponse = {
  ok: boolean;
  message: string;
  payload?: {
    token: string;
    user: User;
  };
  error?: string | string[];
};

export type { User, SignUpResponse, LoginResponse };
