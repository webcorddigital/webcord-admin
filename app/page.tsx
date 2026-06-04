"use client";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { authed } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (authed) router.replace("/dashboard");
    else router.replace("/login");
  }, [authed, router]);
  return null;
}
