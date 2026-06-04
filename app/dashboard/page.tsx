"use client";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import styles from "./page.module.css";

export default function DashboardPage() {
  const works = useQuery(api.works.getAllWorks);
  const pending = useQuery(api.reviews.getReviewsByStatus, { status: "pending" });
  const approved = useQuery(api.reviews.getReviewsByStatus, { status: "approved" });

  const stats = [
    { label: "Total Works",      value: works?.length ?? "—" },
    { label: "Pending Reviews",  value: pending?.length ?? "—", highlight: (pending?.length ?? 0) > 0 },
    { label: "Published Reviews",value: approved?.length ?? "—" },
  ];

  return (
    <div>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.sub}>Welcome back. Here's an overview of your site.</p>

      <div className={styles.statsGrid}>
        {stats.map((s) => (
          <div key={s.label} className={`${styles.statCard} ${s.highlight ? styles.highlight : ""}`}>
            <div className={styles.statNum}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.quickLinks}>
        <a href="/dashboard/works" className={styles.ql}>
          <span className={styles.qlIcon}>🖼️</span>
          <div><strong>Manage Works</strong><p>Add or edit portfolio items</p></div>
        </a>
        <a href="/dashboard/reviews" className={styles.ql}>
          <span className={styles.qlIcon}>⭐</span>
          <div><strong>Moderate Reviews</strong><p>Approve or reject submissions</p></div>
        </a>
        <a href="/dashboard/settings" className={styles.ql}>
          <span className={styles.qlIcon}>⚙️</span>
          <div><strong>Edit Settings</strong><p>Update contact info, pricing</p></div>
        </a>
      </div>
    </div>
  );
}
