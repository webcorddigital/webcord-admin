"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import styles from "./settings.module.css";

type ContactInfo = {
  whatsapp: string;
  whatsappRaw: string;
  email: string;
  website: string;
  location: string;
};

const defaultContact: ContactInfo = {
  whatsapp: "+91 88914 19003",
  whatsappRaw: "918891419003",
  email: "hello@webcord.in",
  website: "webcord.in",
  location: "Phagwara, Punjab, India",
};

export default function SettingsPage() {
  const contactSetting = useQuery(api.settings.getSetting, { key: "contact_info" });
  const setSetting = useMutation(api.settings.setSetting);

  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (contactSetting) {
      setContact({ ...defaultContact, ...(contactSetting as Partial<ContactInfo>) });
    }
  }, [contactSetting]);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Auto-compute whatsappRaw from whatsapp
      const raw = contact.whatsapp.replace(/\D/g, "");
      await setSetting({
        key: "contact_info",
        value: { ...contact, whatsappRaw: raw },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Settings</h1>
      <p className={styles.sub}>Edit contact info and other site-wide settings. Changes are live instantly.</p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Contact Information</h2>
        <p className={styles.sectionNote}>This updates the contact info shown on the main website in real-time.</p>
        <form onSubmit={handleSaveContact} className={styles.form}>
          <div className={styles.row}>
            <div className="form-group">
              <label>WhatsApp Number (display)</label>
              <input className="input" value={contact.whatsapp} onChange={e => setContact({ ...contact, whatsapp: e.target.value })} placeholder="+91 88914 19003" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="input" type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} placeholder="hello@webcord.in" />
            </div>
          </div>
          <div className={styles.row}>
            <div className="form-group">
              <label>Website</label>
              <input className="input" value={contact.website} onChange={e => setContact({ ...contact, website: e.target.value })} placeholder="webcord.in" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input className="input" value={contact.location} onChange={e => setContact({ ...contact, location: e.target.value })} placeholder="Phagwara, Punjab, India" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saved ? <><Save size={14} /> Saved!</> : <><Save size={14} /> {saving ? "Saving..." : "Save Contact Info"}</>}
          </button>
        </form>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Site Info</h2>
        <div className={styles.infoCard}>
          <div className={styles.infoRow}>
            <span>Main Website</span>
            <a href="https://webcord.in" target="_blank" rel="noopener noreferrer">webcord.in ↗</a>
          </div>
          <div className={styles.infoRow}>
            <span>Admin Panel</span>
            <span>webcord-admin.vercel.app</span>
          </div>
          <div className={styles.infoRow}>
            <span>Database</span>
            <span>Convex (Webcord.in project)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
