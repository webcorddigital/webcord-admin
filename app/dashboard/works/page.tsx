"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef } from "react";
import { Plus, Trash2, Edit2, X, Check, ExternalLink } from "lucide-react";
import styles from "./works.module.css";
import { Id } from "@/convex/_generated/dataModel";

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
  const [editId, setEditId] = useState<Id<"works"> | null>(null);
  const [form, setForm] = useState({ title: "", link: "", description: "" });
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgPreview, setImgPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
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
    try {
      // 1. Insert work entry
      const workId = await addWork({
        title: form.title,
        link: form.link.startsWith("http") ? form.link : `https://${form.link}`,
        description: form.description || undefined,
      });

      // 2. Upload image if provided
      if (imgFile && workId) {
        const webpBlob = await toWebpBlob(imgFile);
        const uploadUrl = await generateUploadUrl();
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "image/webp" },
          body: webpBlob,
        });
        if (res.ok) {
          const { storageId } = await res.json();
          await saveImageId({ id: workId as Id<"works">, storageId });
        }
      }

      setForm({ title: "", link: "", description: "" });
      setImgFile(null);
      setImgPreview("");
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert("Error adding work");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: Id<"works">) => {
    if (!confirm("Delete this work? This cannot be undone.")) return;
    await deleteWork({ id });
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
              <div className={styles.actions}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Uploading..." : <><Check size={16} /> Save Work</>}
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
          {works.map((w) => (
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
                <button className="btn btn-danger" onClick={() => handleDelete(w._id as Id<"works">)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
