import { createContext, useContext, useEffect, useState } from "react";
import api from "../configs/api";

// ✅ Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  signUp: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

// ✅ Context
const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ LOGIN
  const login = async (data: { email: string; password: string }) => {
    try {
      const res = await api.post("/api/auth/login", data);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setUser(user);

    } catch (err: any) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";

      console.error("LOGIN ERROR:", message);
      throw new Error(message);
    }
  };

  // ✅ REGISTER
  const signUp = async (data: { name: string; email: string; password: string }) => {
    try {
      const res = await api.post("/api/auth/register", data);

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      setUser(user);

    } catch (err: any) {
      const message =
        err.response?.data?.message || "Signup failed. Please try again.";

      console.error("SIGNUP ERROR:", message);
      throw new Error(message);
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ✅ FETCH USER (AUTO LOGIN)
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const res = await api.get("/api/auth/verify");
      setUser(res.data.user);

    } catch (err: any) {
      console.error("VERIFY ERROR:", err.response?.data || err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};