"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef } from "react";
import { Plus, Trash2, X, Check, ExternalLink, Upload } from "lucide-react";
import styles from "./works.module.css";
import { Id } from "@/convex/_generated/dataModel";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";

// Convert any image to WebP using Canvas
async function toWebpBlob(file: File, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        "image/webp",
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

export default function WorksPage() {
  const works = useQuery(api.works.getAllWorks);
  const addWork = useMutation(api.works.addWork);
  const deleteWork = useMutation(api.works.deleteWork);
  const generateUploadUrl = useMutation(api.works.generateUploadUrl);
  const saveImageId = useMutation(api.works.saveWorkImageId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", link: "", description: "" });
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<Id<"works"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setImgPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.link) return;
    setLoading(true);
    setUploadError(null);
    
    const promise = (async () => {
      // 1. Insert work entry
      const workId = await addWork({
        title: form.title,
        link: form.link.startsWith("http") ? form.link : `https://${form.link}`,
        description: form.description || undefined,
      });

      // 2. Upload image if provided
      if (imgFile && workId) {
        try {
          const webpBlob = await toWebpBlob(imgFile);
          const uploadUrl = await generateUploadUrl();
          const res = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": "image/webp" },
            body: webpBlob,
          });
          if (res.ok) {
            const data = await res.json();
            const storageId = (data.storageId ?? data) as Id<"_storage">;
            await saveImageId({ id: workId as Id<"works">, storageId });
          } else {
            console.error("Image upload failed:", res.status, res.statusText);
          }
        } catch (imgErr) {
          console.error("Image upload error:", imgErr);
        }
      }

      setForm({ title: "", link: "", description: "" });
      setImgFile(null);
      setImgPreview("");
      if (fileRef.current) fileRef.current.value = "";
      setShowForm(false);
    })();

    toast.promise(promise, {
      loading: 'Saving work...',
      success: 'Work added successfully!',
      error: 'Failed to save work.',
    });

    try {
      await promise;
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await deleteWork({ id: deleteId });
      toast.success("Work deleted successfully");
    } catch (e) {
      toast.error("Failed to delete work");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Works</h1>
          <p className={styles.sub}>Manage portfolio items shown on webcord.in/works</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Work
        </button>
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add New Work</h2>
              <button className={styles.closeBtn} onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Project Title *</label>
                <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Singh Auto Works Website" required />
              </div>
              <div className="form-group">
                <label>Website Link *</label>
                <input className="input" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} placeholder="https://singhautoworks.in" required />
              </div>
              <div className="form-group">
                <label>Short Description</label>
                <textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What was built and for whom..." />
              </div>
              <div className="form-group">
                <label>Preview Image (auto-converted to WebP)</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className={styles.fileInput} />
                {imgPreview && (
                  <div className={styles.preview}>
                    <img src={imgPreview} alt="Preview" />
                    <button type="button" className={styles.clearImg} onClick={() => { setImgFile(null); setImgPreview(""); if (fileRef.current) fileRef.current.value = ""; }}>
                      <X size={14} /> Clear
                    </button>
                  </div>
                )}
              </div>
              {uploadError && (
                <p style={{ color: "var(--danger)", fontSize: "0.82rem", marginTop: "-8px", marginBottom: "8px" }}>
                  {uploadError}
                </p>
              )}
              <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setUploadError(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <><Upload size={15} /> Uploading...</> : <><Check size={16} /> Save Work</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Works Table */}
      {works === undefined ? (
        <div className={styles.loading}>Loading...</div>
      ) : works.length === 0 ? (
        <div className={styles.empty}>No works yet. Add your first project above.</div>
      ) : (
        <div className={styles.grid}>
          {works?.map((w: any) => (
            <div key={w._id} className={styles.workCard}>
              <div className={styles.workImg}>
                {w.imageUrl ? <img src={w.imageUrl} alt={w.title} /> : <div className={styles.noImg}>No Image</div>}
              </div>
              <div className={styles.workInfo}>
                <h3>{w.title}</h3>
                {w.description && <p>{w.description}</p>}
                <a href={w.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  <ExternalLink size={12} /> {w.link}
                </a>
              </div>
              <div className={styles.workActions}>
                <button className="btn btn-danger" onClick={() => setDeleteId(w._id as Id<"works">)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Work"
        message="Are you sure you want to delete this work? This action cannot be undone and it will be removed from your portfolio."
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
}
