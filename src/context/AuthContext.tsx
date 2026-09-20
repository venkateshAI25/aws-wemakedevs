import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  email: string;
  name: string;
  role: string;
  connected_platforms: string[];
  settings?: {
    notify_messages?: boolean;
    notify_reports?: boolean;
  };
}

interface AuthContextType {
  user: User | false | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  patchUser: (partial: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | false | null>(null); // null=checking, false=guest, obj=user
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token = localStorage.getItem("sc_token");
    if (!token) {
      token = "demo-token";
      localStorage.setItem("sc_token", token);
    }
    api.get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => {
        localStorage.removeItem("sc_token");
        setUser(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const applyAuth = (data: { access_token: string; user: User }) => {
    localStorage.setItem("sc_token", data.access_token);
    setUser(data.user);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    applyAuth(data);
    return data.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    applyAuth(data);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("sc_token");
    setUser(false);
  };

  const patchUser = (partial: Partial<User>) =>
    setUser((u) => (u ? { ...u, ...partial } : u));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, patchUser }}>
      {children}
    </AuthContext.Provider>
  );
}
