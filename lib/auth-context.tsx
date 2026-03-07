"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
    color: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    refresh: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refresh: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = () => {
        setLoading(true);
        fetch("/api/auth/me")
            .then(r => r.json())
            .then(data => {
                if (data?.user) setUser(data.user);
                else setUser(null);
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchUser(); }, []);

    return (
        <AuthContext.Provider value={{ user, loading, refresh: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
