import { createContext, useState, useEffect, type ReactNode } from "react";
import { api } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  }

  async function refreshUser() {
    const refreshRes = await api.post("/auth/refresh");
    localStorage.setItem("token", refreshRes.data.token);
    const meRes = await api.get("/auth/me");
    setUser(meRes.data.user);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
