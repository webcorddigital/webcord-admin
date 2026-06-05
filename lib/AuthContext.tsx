"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const AUTH_KEY = "webcord_admin_auth";

interface AuthCtx {
  authed: boolean;
  login: (pw: string) => Promise<boolean>;
  logout: () => void;
}
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const verifyPassword = useMutation(api.auth.verifyPassword);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(AUTH_KEY) === "1");
  }, []);

  const login = async (pw: string) => {
    try {
      const isValid = await verifyPassword({ password: pw });
      if (isValid) {
        sessionStorage.setItem(AUTH_KEY, "1");
        setAuthed(true);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
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
