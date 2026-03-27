import { createContext, useContext, useEffect, useState } from "react";
import api from "../configs/api";

// ✅ Define types
interface AuthContextType {
  user: any;
  login: (data: any) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  logout: () => void;
}

// ✅ Add type here
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  const login = async (data: any) => {
    const res = await api.post("/api/auth/login", data);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const signUp = async (data: any) => {
    const res = await api.post("/api/auth/register", data);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await api.get("/api/auth/verify");
    setUser(res.data.user);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Safe hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext not found");
  return context;
};