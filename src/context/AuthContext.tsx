import { createContext, useContext, useState, useEffect } from "react";
import { clearAuthTokens } from "../lib/api";

type AuthUser = {
  id: string;
  user_id?: string;
  username?: string;
  display_name?: string;
};

type AuthContextType = {
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  privateKey: CryptoKey | null;
  setPrivateKey: (key: CryptoKey | null) => void;
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [currentUser, setCurrentUserState] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUserState(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const value = {
    token,
    setToken: (token: string | null) => {
      if (token) {
        localStorage.setItem("token", token);
      } else {
        clearAuthTokens();
        setCurrentUserState(null);
      }
      setToken(token);
    },
    isAuthenticated: !!token,
    privateKey,
    setPrivateKey,
    currentUser,
    setCurrentUser: (user: AuthUser | null) => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
      setCurrentUserState(user);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext not found");
  return ctx;
}
