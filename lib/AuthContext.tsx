"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const AUTH_KEY = "webcord_admin_auth";
const PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "webcord2025";

interface AuthCtx {
  authed: boolean;
  login: (pw: string) => boolean;
  logout: () => void;
}
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
  }, []);

  const login = (pw: string) => {
    if (pw === PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setAuthed(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  };

  return <Ctx.Provider value={{ authed, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
