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
    settings: any;
    loading: boolean;
    refresh: () => void;
    refreshSettings: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    settings: {}, 
    loading: true, 
    refresh: () => {},
    refreshSettings: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [settings, setSettings] = useState<any>({});
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

    const fetchSettings = () => {
        fetch("/api/admin/settings")
            .then(r => r.json())
            .then(data => {
                if (data) setSettings(data);
            })
            .catch(() => {});
    };

    useEffect(() => { 
        fetchUser(); 
        fetchSettings();
    }, []);

    return (
        <AuthContext.Provider value={{ 
            user, 
            settings, 
            loading, 
            refresh: fetchUser,
            refreshSettings: fetchSettings
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
