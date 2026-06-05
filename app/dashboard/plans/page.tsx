"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Plus, Trash2, Save, RefreshCw, Star } from "lucide-react";
import styles from "./plans.module.css";
import toast from "react-hot-toast";

const CATEGORY_LABELS: Record<string, string> = {
  website: "Website",
  monthly: "Monthly",
  video: "Video",
};

export default function PlansPage() {
  const plans = useQuery((api as any).plans.getAllPlans);
  const updatePlan = useMutation((api as any).plans.updatePlan);
  const seedPlans = useMutation((api as any).plans.seedPlans);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const handleSelect = (plan: any) => {
    setSelectedId(plan._id);
    setForm(JSON.parse(JSON.stringify(plan)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await updatePlan({
        id: form._id,
        slug: form.slug,
        category: form.category,
        badge: form.badge,
        name: form.name,
        price: Number(form.price),
        priceLabel: form.priceLabel,
        delivery: form.delivery,
        features: form.features.filter((f: string) => f.trim()),
        featured: form.featured ?? false,
        description: form.description,
        whatYouGet: form.whatYouGet.filter((f: string) => f.trim()),
        idealFor: form.idealFor.filter((f: string) => f.trim()),
        faqs: form.faqs.filter((f: any) => f.question.trim()),
        reviewCount: Number(form.reviewCount),
        reviewAvg: Number(form.reviewAvg),
      });
      toast.success("Plan saved.");
    } catch (err) {
      toast.error("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const content = await fetch("/api/plans-seed-data").then((r) => r.json()).catch(() => null);
      // Fallback: use seedPlans without args if server not available
      await (seedPlans as any)({});
      toast.success("Plans reset from defaults.");
    } catch {
      toast.error("Seed failed.");
    } finally {
      setSeeding(false);
    }
  };

  const updateField = (key: string, val: any) => setForm((f: any) => ({ ...f, [key]: val }));

  const updateArrayItem = (field: string, idx: number, val: string) => {
    const arr = [...form[field]];
    arr[idx] = val;
    updateField(field, arr);
  };

  const addArrayItem = (field: string) => updateField(field, [...form[field], ""]);

  const removeArrayItem = (field: string, idx: number) =>
    updateField(field, form[field].filter((_: any, i: number) => i !== idx));

  const updateFaqField = (idx: number, key: "question" | "answer", val: string) => {
    const faqs = [...form.faqs];
    faqs[idx] = { ...faqs[idx], [key]: val };
    updateField("faqs", faqs);
  };

  const addFaq = () => updateField("faqs", [...form.faqs, { question: "", answer: "" }]);
  const removeFaq = (idx: number) =>
    updateField("faqs", form.faqs.filter((_: any, i: number) => i !== idx));

  const grouped = (plans ?? []).reduce((acc: any, plan: any) => {
    const cat = plan.category || "website";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(plan);
    return acc;
  }, {});

  if (plans === undefined) {
    return (
      <div className={styles.loading}>
        <RefreshCw size={18} className={styles.spin} />
        Loading plans
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* LEFT PANEL — Plan List */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div>
            <h1 className={styles.pageTitle}>Plans</h1>
            <p className={styles.pageSub}>{plans.length} plans total</p>
          </div>
          <button
            className={styles.seedBtn}
            onClick={handleSeed}
            disabled={seeding}
            title="Reset all plans to defaults from JSON"
          >
            <RefreshCw size={14} className={seeding ? styles.spin : ""} />
            Reset
          </button>
        </div>

        {Object.entries(CATEGORY_LABELS).map(([cat, label]) =>
          grouped[cat] ? (
            <div key={cat} className={styles.group}>
              <div className={styles.groupLabel}>{label}</div>
              {grouped[cat]
                .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
                .map((plan: any) => (
                  <button
                    key={plan._id}
                    className={`${styles.planRow} ${selectedId === plan._id ? styles.active : ""}`}
                    onClick={() => handleSelect(plan)}
                  >
                    <div className={styles.planRowInner}>
                      <span className={styles.planName}>{plan.name}</span>
                      {plan.featured && <Star size={10} className={styles.featuredIcon} />}
                    </div>
                    <span className={styles.planPrice}>{plan.priceLabel}</span>
                  </button>
                ))}
            </div>
          ) : null
        )}

        {plans.length === 0 && (
          <div className={styles.empty}>
            No plans. Click Reset to import defaults.
          </div>
        )}
      </aside>

      {/* RIGHT PANEL — Editor */}
      <main className={styles.editor}>
        {!form ? (
          <div className={styles.placeholder}>
            <div className={styles.placeholderIcon}>⟵</div>
            <p>Select a plan to edit</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className={styles.editorForm}>
            {/* Sticky header */}
            <div className={styles.editorHeader}>
              <div>
                <h2 className={styles.editorTitle}>{form.name}</h2>
                <span className={styles.editorCat}>{CATEGORY_LABELS[form.category]}</span>
              </div>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                <Save size={14} />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>

            <div className={styles.sections}>
              {/* ── IDENTITY ── */}
              <section className={styles.section}>
                <div className={styles.sectionLabel}>Identity</div>
                <div className={styles.grid2}>
                  <Field label="Plan Name">
                    <input className={styles.input} value={form.name}
                      onChange={e => updateField("name", e.target.value)} required />
                  </Field>
                  <Field label="Slug">
                    <input className={styles.input} value={form.slug}
                      onChange={e => updateField("slug", e.target.value)} required />
                  </Field>
                  <Field label="Badge">
                    <input className={styles.input} value={form.badge}
                      onChange={e => updateField("badge", e.target.value)} />
                  </Field>
                  <Field label="Category">
                    <select className={styles.input} value={form.category}
                      onChange={e => updateField("category", e.target.value)}>
                      <option value="website">Website</option>
                      <option value="monthly">Monthly</option>
                      <option value="video">Video</option>
                    </select>
                  </Field>
                </div>
                <Field label="Description">
                  <textarea className={styles.input} rows={3} value={form.description}
                    onChange={e => updateField("description", e.target.value)} required />
                </Field>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={!!form.featured}
                    onChange={e => updateField("featured", e.target.checked)} />
                  <span>Mark as Featured (highlighted on pricing page)</span>
                </label>
              </section>

              <hr className={styles.divider} />

              {/* ── PRICING ── */}
              <section className={styles.section}>
                <div className={styles.sectionLabel}>Pricing</div>
                <div className={styles.grid3}>
                  <Field label="Price (₹)">
                    <input type="number" className={styles.input} value={form.price}
                      onChange={e => updateField("price", e.target.value)} required />
                  </Field>
                  <Field label="Display Label">
                    <input className={styles.input} value={form.priceLabel}
                      placeholder="₹7,000 / one-time"
                      onChange={e => updateField("priceLabel", e.target.value)} required />
                  </Field>
                  <Field label="Delivery Time">
                    <input className={styles.input} value={form.delivery}
                      placeholder="5-7 days"
                      onChange={e => updateField("delivery", e.target.value)} />
                  </Field>
                </div>
              </section>

              <hr className={styles.divider} />

              {/* ── REVIEWS ── */}
              <section className={styles.section}>
                <div className={styles.sectionLabel}>Review Stats</div>
                <div className={styles.grid2} style={{ maxWidth: 420 }}>
                  <Field label="Review Count">
                    <input type="number" className={styles.input} value={form.reviewCount}
                      onChange={e => updateField("reviewCount", e.target.value)} />
                  </Field>
                  <Field label="Average Rating (0–5)">
                    <input type="number" step="0.1" min="0" max="5" className={styles.input}
                      value={form.reviewAvg}
                      onChange={e => updateField("reviewAvg", e.target.value)} />
                  </Field>
                </div>
              </section>

              <hr className={styles.divider} />

              {/* ── FEATURES (Card) ── */}
              <section className={styles.section}>
                <div className={styles.sectionLabel}>Features</div>
                <p className={styles.sectionHint}>Shown as bullet points on the pricing card.</p>
                <ArrayEditor
                  items={form.features}
                  onAdd={() => addArrayItem("features")}
                  onRemove={i => removeArrayItem("features", i)}
                  onChange={(i, v) => updateArrayItem("features", i, v)}
                  inputClass={styles.input}
                  addLabel="Add Feature"
                />
              </section>

              <hr className={styles.divider} />

              {/* ── WHAT YOU GET ── */}
              <section className={styles.section}>
                <div className={styles.sectionLabel}>What You Get</div>
                <p className={styles.sectionHint}>Shown on the plan detail page.</p>
                <ArrayEditor
                  items={form.whatYouGet}
                  onAdd={() => addArrayItem("whatYouGet")}
                  onRemove={i => removeArrayItem("whatYouGet", i)}
                  onChange={(i, v) => updateArrayItem("whatYouGet", i, v)}
                  inputClass={styles.input}
                  addLabel="Add Item"
                />
              </section>

              <hr className={styles.divider} />

              {/* ── IDEAL FOR ── */}
              <section className={styles.section}>
                <div className={styles.sectionLabel}>Ideal For</div>
                <p className={styles.sectionHint}>Who this plan is suited for.</p>
                <ArrayEditor
                  items={form.idealFor}
                  onAdd={() => addArrayItem("idealFor")}
                  onRemove={i => removeArrayItem("idealFor", i)}
                  onChange={(i, v) => updateArrayItem("idealFor", i, v)}
                  inputClass={styles.input}
                  addLabel="Add Target"
                />
              </section>

              <hr className={styles.divider} />

              {/* ── FAQs ── */}
              <section className={styles.section}>
                <div className={styles.sectionLabel}>FAQs</div>
                <p className={styles.sectionHint}>Questions shown on the plan detail page.</p>
                <div className={styles.faqList}>
                  {form.faqs.map((faq: any, i: number) => (
                    <div key={i} className={styles.faqItem}>
                      <div className={styles.faqNum}>{i + 1}</div>
                      <div className={styles.faqFields}>
                        <input
                          className={styles.input}
                          placeholder="Question"
                          value={faq.question}
                          onChange={e => updateFaqField(i, "question", e.target.value)}
                        />
                        <textarea
                          className={styles.input}
                          placeholder="Answer"
                          rows={2}
                          value={faq.answer}
                          onChange={e => updateFaqField(i, "answer", e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeFaq(i)}
                        title="Remove FAQ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" className={styles.addBtn} onClick={addFaq}>
                  <Plus size={13} /> Add FAQ
                </button>
              </section>

              {/* Bottom save */}
              <div className={styles.bottomSave}>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  <Save size={14} />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
    </div>
  );
}

function ArrayEditor({
  items,
  onAdd,
  onRemove,
  onChange,
  inputClass,
  addLabel,
}: {
  items: string[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onChange: (i: number, v: string) => void;
  inputClass: string;
  addLabel: string;
}) {
  return (
    <div>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--text-dim)", minWidth: 18 }}>
              {i + 1}
            </span>
            <input
              className={inputClass}
              value={item}
              onChange={e => onChange(i, e.target.value)}
            />
            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-dim)",
                cursor: "pointer",
                padding: "4px",
                flexShrink: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}
              onClick={() => onRemove(i)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-ghost" style={{ marginTop: 12, padding: "6px 14px", fontSize: "0.8rem", borderRadius: 6 }} onClick={onAdd}>
        <Plus size={12} /> {addLabel}
      </button>
    </div>
  );
}
