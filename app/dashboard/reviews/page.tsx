"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Check, X, Trash2, Star } from "lucide-react";
import styles from "./reviews.module.css";
import { Id } from "@/convex/_generated/dataModel";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";

type Status = "pending" | "approved" | "rejected";

export default function ReviewsPage() {
  const [tab, setTab] = useState<Status>("pending");
  const [confirmAction, setConfirmAction] = useState<{ type: "reject" | "delete", id: Id<"reviews"> } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const reviews    = useQuery(api.reviews.getReviewsByStatus, { status: tab });
  const pendingAll = useQuery(api.reviews.getReviewsByStatus, { status: "pending" });
  const approve    = useMutation(api.reviews.approveReview);
  const reject     = useMutation(api.reviews.rejectReview);
  const deleteReview = useMutation(api.reviews.deleteReview);

  const tabs: { key: Status; label: string }[] = [
    { key: "pending",  label: "Pending"  },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  const pendingCount = pendingAll?.length ?? 0;

  const handleApprove = async (id: Id<"reviews">) => {
    try {
      await approve({ id });
      toast.success("Review approved");
    } catch (e) {
      toast.error("Failed to approve review");
    }
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
      if (confirmAction.type === "reject") {
        await reject({ id: confirmAction.id });
        toast.success("Review rejected");
      } else if (confirmAction.type === "delete") {
        await deleteReview({ id: confirmAction.id });
        toast.success("Review deleted");
      }
    } catch (e) {
      toast.error(`Failed to ${confirmAction.type} review`);
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Reviews</h1>
      <p className={styles.sub}>
        Approve or reject user-submitted reviews before they appear on the website.
      </p>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`${styles.tab} ${tab === t.key ? styles.activeTab : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === "pending" && pendingCount > 0 && (
              <span className={styles.badge}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {reviews === undefined ? (
        <div className={styles.loading}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className={styles.empty}>No {tab} reviews.</div>
      ) : (
        <div className={styles.list}>
          {(reviews as any[]).map((r) => (
            <div key={r._id} className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <span className={`badge badge-${r.status}`}>{r.status}</span>
                  <div className={styles.stars}>
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <span className={styles.date}>
                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className={styles.text}>&ldquo;{r.text}&rdquo;</p>
              <div className={styles.meta}>
                <strong>{r.author}</strong>
                {r.business && <span>{r.business}</span>}
              </div>
              <div className={styles.actions}>
                {tab !== "approved" && (
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(r._id as Id<"reviews">)}
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                {tab !== "rejected" && (
                  <button
                    className="btn btn-ghost"
                    onClick={() => setConfirmAction({ type: "reject", id: r._id as Id<"reviews"> })}
                  >
                    <X size={14} /> Reject
                  </button>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() => setConfirmAction({ type: "delete", id: r._id as Id<"reviews"> })}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeAction}
        title={confirmAction?.type === "delete" ? "Delete Review" : "Reject Review"}
        message={`Are you sure you want to ${confirmAction?.type} this review? This action cannot be undone.`}
        confirmText={confirmAction?.type === "delete" ? "Delete" : "Reject"}
        isLoading={isProcessing}
      />
    </div>
  );
}
