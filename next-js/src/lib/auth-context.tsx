'use client'
import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
    id: string;
    email: string;
    username: string;
    createdAt: string;
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get API URL based on hostname
const getApiUrl = (): string => {
    if (typeof window === "undefined") return "http://localhost:3001";

    const host = window.location.hostname;
    const protocol = window.location.protocol;

    // If on localhost, use localhost
    if (host === "localhost" || host === "127.0.0.1") {
        return "http://localhost:3001";
    }

    // Otherwise, use the same host with port 3001 (for network access)
    return `${protocol}//${host}:3001`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [apiUrl, setApiUrl] = useState<string>("http://localhost:3001");

    // Initialize API URL on client mount
    useEffect(() => {
        setApiUrl(getApiUrl());
    }, []);

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("authToken");
                const url = getApiUrl();
                if (token) {
                    const response = await fetch(`${url}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        localStorage.removeItem("authToken");
                    }
                }
            } catch (err) {
                console.error("Auth check failed:", err);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);

            const url = getApiUrl();
            const response = await fetch(`${url}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            localStorage.setItem("authToken", data.token);
            setUser(data.user);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Login failed";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (email: string, username: string, password: string) => {
        try {
            setError(null);
            setIsLoading(true);

            const url = getApiUrl();
            const response = await fetch(`${url}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Signup failed");
            }

            localStorage.setItem("authToken", data.token);
            setUser(data.user);
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Signup failed";
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem("authToken");
            const url = getApiUrl();
            if (token) {
                await fetch(`${url}/api/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            localStorage.removeItem("authToken");
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                error,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
