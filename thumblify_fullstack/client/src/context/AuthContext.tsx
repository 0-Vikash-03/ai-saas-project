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
  loading: boolean; // ✅ ADD THIS
  login: (data: { email: string; password: string }) => Promise<void>;
  signUp: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

// ✅ Context
const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ✅ ADD THIS

  // ✅ LOGIN
  const login = async (data: { email: string; password: string }) => {
    try {
      const res = await api.post("/api/auth/login", data);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

    } catch (err: any) {
      console.error("LOGIN ERROR:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ REGISTER
  const signUp = async (data: { name: string; email: string; password: string }) => {
    try {
      const res = await api.post("/api/auth/register", data);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

    } catch (err: any) {
      console.error("SIGNUP ERROR:", err.response?.data || err.message);
      throw err;
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // ✅ FETCH USER
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false); // ✅ IMPORTANT
        return;
      }

      const res = await api.get("/api/auth/verify");
      setUser(res.data.user);

    } catch (err) {
      console.error("VERIFY ERROR:", err);
      logout();
    } finally {
      setLoading(false); // ✅ IMPORTANT
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
  if (!context) throw new Error("AuthContext not found");
  return context;
};