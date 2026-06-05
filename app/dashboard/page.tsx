"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Briefcase, MessageSquare, Settings } from "lucide-react";
import styles from "./page.module.css";

const quickLinks = [
  {
    href: "/dashboard/works",
    icon: Briefcase,
    title: "Manage Works",
    desc: "Add or edit portfolio items",
  },
  {
    href: "/dashboard/reviews",
    icon: MessageSquare,
    title: "Moderate Reviews",
    desc: "Approve or reject submissions",
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    title: "Edit Settings",
    desc: "Update contact info and site data",
  },
];

export default function DashboardPage() {
  const works = useQuery(api.works.getAllWorks);
  const pending = useQuery(api.reviews.getReviewsByStatus, { status: "pending" });
  const approved = useQuery(api.reviews.getReviewsByStatus, { status: "approved" });

  const stats = [
    { label: "Total Works",       value: works?.length ?? "—" },
    { label: "Pending Reviews",   value: pending?.length ?? "—", highlight: (pending?.length ?? 0) > 0 },
    { label: "Published Reviews", value: approved?.length ?? "—" },
  ];

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.sub}>Welcome back. Here&apos;s an overview of your site.</p>

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={`${styles.statCard} ${s.highlight ? styles.highlight : ""}`}>
            <div className={styles.statNum}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.quickLinks}>
        {quickLinks.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href} className={styles.ql}>
            <span className={styles.qlIcon}><Icon size={22} strokeWidth={1.5} /></span>
            <div>
              <strong>{title}</strong>
              <p>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
