// admin-project/src/app/(dashboard)/skills/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Skill = {
  _id: string;
  name: string;
  category?: string;
  level?: string;
  imageURL?: string;
  cloudinaryPublicId?: string; // ✅ Added
  featured?: boolean;
};
type SkillInput = Omit<Skill, "_id">;

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [open, setOpen] = useState(false);

  const title = useMemo(() => (editing ? "Edit Skill" : "Add Skill"), [editing]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/skills", { cache: "no-store" });
      const data = await res.json();
      setSkills(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(row: Skill) {
    setEditing(row);
    setOpen(true);
  }

  async function remove(id: string) {
    if (!confirm("Delete this skill?")) return;
    const res = await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    setSkills((s) => s.filter((x) => x._id !== id));
  }

  async function save(values: SkillInput) {
    if (editing) {
      const res = await fetch(`/api/skills/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) return alert("Update failed");
      const updated: Skill = await res.json();
      setSkills((s) => s.map((x) => (x._id === updated._id ? updated : x)));
    } else {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) return alert("Create failed");
      const created: Skill = await res.json();
      setSkills((s) => [created, ...s]);
    }
    setOpen(false);
    setEditing(null);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-cyan-400">Skills Management</h1>
        <button
          onClick={openCreate}
          className="rounded bg-cyan-500 px-4 py-2 text-black font-medium hover:bg-cyan-400"
        >
          + Add Skill
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-4 py-3 text-left">Skill</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Level</th>
              <th className="px-4 py-3 text-left">Featured</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-950">
            {loading ? (
              <tr>
                <td className="px-4 py-5 text-gray-400" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : skills.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-gray-400" colSpan={5}>
                  No skills yet. Click "Add Skill".
                </td>
              </tr>
            ) : (
              skills.map((row) => (
                <tr
                  key={row._id}
                  className="hover:bg-gray-900 transition-colors duration-200"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    <div className="flex items-center gap-3">
                      {row.imageURL ? (
                        <img
                          src={row.imageURL}
                          alt={row.name}
                          className="h-10 w-10 rounded-full object-cover border border-gray-700 shadow-sm"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 text-sm">
                          ?
                        </div>
                      )}
                      <span className="capitalize">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {row.category || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{row.level || "-"}</td>
                  <td className="px-4 py-3">
                    {row.featured ? (
                      <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-3 py-1 text-xs font-semibold">
                        Featured
                      </span>
                    ) : (
                      <span className="rounded-full border border-gray-700 px-3 py-1 text-xs text-gray-400">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="rounded bg-yellow-400 px-3 py-1.5 text-black hover:bg-yellow-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => remove(row._id)}
                        className="rounded bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <SkillModal
          title={title}
          initial={editing ?? undefined}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={save}
        />
      )}
    </div>
  );
}

/* ---------------- Modal ---------------- */

function SkillModal({
  title,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  initial?: Skill;
  onClose: () => void;
  onSave: (values: SkillInput) => Promise<void> | void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<SkillInput>({
    name: initial?.name || "",
    category: initial?.category || "",
    level: initial?.level || "",
    imageURL: initial?.imageURL || "",
    cloudinaryPublicId: initial?.cloudinaryPublicId || "", // ✅ Added
    featured: !!initial?.featured,
  });

  function set<K extends keyof SkillInput>(key: K, val: SkillInput[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  // ✅ Auto-upload to Cloudinary on file select
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/skills/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data?.success) {
        set("imageURL", data.path); // Cloudinary URL
        set("cloudinaryPublicId", data.public_id); // ✅ Save public_id for deletion
      } else {
        alert(data?.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!form.name.trim()) return alert("Name is required");
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-950 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-cyan-400">{title}</h2>
          <button
            onClick={onClose}
            className="rounded border border-gray-700 px-3 py-1.5 text-gray-300 hover:bg-gray-800"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Labeled
            label="Name *"
            value={form.name}
            onChange={(v) => set("name", v)}
            placeholder="Python"
          />
          <Labeled
            label="Category"
            value={form.category || ""}
            onChange={(v) => set("category", v)}
            placeholder="Backend / Frontend / Tools"
          />
          <Labeled
            label="Level"
            value={form.level || ""}
            onChange={(v) => set("level", v)}
            placeholder="Beginner / Intermediate / Expert"
          />

          <div className="rounded-lg border border-gray-800 p-3">
            <label className="mb-1 block text-sm text-gray-300">
              Logo (auto-upload to Cloudinary)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-300"
            />
            <div className="mt-3 flex items-center gap-3">
              {uploading && (
                <span className="text-sm text-cyan-400">Uploading to Cloudinary...</span>
              )}
              {form.imageURL && (
                <img
                  src={form.imageURL}
                  alt="preview"
                  className="h-10 w-10 rounded-full object-cover border border-gray-700 shadow-sm"
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="featured"
              type="checkbox"
              checked={!!form.featured}
              onChange={(e) => set("featured", e.target.checked)}
              className="h-4 w-4 accent-cyan-500"
            />
            <label htmlFor="featured" className="text-sm text-gray-300">
              Featured
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded border border-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="rounded bg-cyan-500 px-4 py-2 font-medium text-black hover:bg-cyan-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Labeled({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-gray-300">{label}</label>
      <input
        className="w-full rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-200 outline-none focus:ring-1 focus:ring-cyan-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}