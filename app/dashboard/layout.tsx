"use client";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { LayoutDashboard, Briefcase, MessageSquare, Settings, LogOut, Tag } from "lucide-react";
import styles from "./dashboard.module.css";

const navItems = [
  { href: "/dashboard",          label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/works",    label: "Works",     icon: Briefcase },
  { href: "/dashboard/reviews",  label: "Reviews",   icon: MessageSquare },
  { href: "/dashboard/plans",    label: "Plans",     icon: Tag },
  { href: "/dashboard/settings", label: "Settings",  icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { authed, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authed) router.replace("/login");
  }, [authed, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!authed) return null;

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>WEBCORD</div>
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.active : ""}`}
              >
                <Icon size={16} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className={`${styles.navItem} ${styles.logout}`} onClick={handleLogout}>
          <LogOut size={16} strokeWidth={1.5} />
          Logout
        </button>
      </aside>
      <main className={`${styles.main} ${pathname.startsWith("/dashboard/plans") ? "" : styles.padded}`}>{children}</main>
    </div>
  );
}
