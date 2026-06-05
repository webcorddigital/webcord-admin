"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { Lock } from "lucide-react";
import styles from "./login.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(pw);
    if (!ok) {
      setError(true);
      setPw("");
      setTimeout(() => setError(false), 2000);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.box}>
        <div className={styles.logo}>WEBCORD</div>
        <p className={styles.sub}>Admin Panel</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputWrapper}>
            <Lock size={16} className={styles.icon} />
            <input
              type="password"
              className={`${styles.input} ${error ? styles.error : ""}`}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Enter password"
              autoFocus
            />
          </div>
          {error && <p className={styles.errMsg}>Wrong password</p>}
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
