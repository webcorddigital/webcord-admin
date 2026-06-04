"use client";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Image, Star, Settings, LogOut } from "lucide-react";
import styles from "./dashboard.module.css";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/works",    label: "Works",    icon: Image },
  { href: "/dashboard/reviews",  label: "Reviews",  icon: Star },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { authed, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authed) router.replace("/login");
  }, [authed, router]);

  if (!authed) return null;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>WEBCORD</div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.active : ""}`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className={`${styles.navItem} ${styles.logout}`} onClick={logout}>
          <LogOut size={16} />
          Logout
        </button>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
