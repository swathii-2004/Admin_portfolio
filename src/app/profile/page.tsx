"use client";

import { useEffect, useState } from "react";

type Profile = {
  name: string;
  title: string;
  bio: string;
  socials: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    email?: string;
    phone?: string;
  };
  profileImage?: string;
  cloudinaryImageId?: string;
};

export default function ProfilePage() {
  // -------- Form state --------
  const [form, setForm] = useState<Profile>({
    name: "",
    title: "",
    bio: "",
    socials: {
      github: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      email: "",
      phone: "",
    },
    profileImage: "",
    cloudinaryImageId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // -------- Upload state --------
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  // ===== Load existing profile =====
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const data = await res.json();
        if (data && Object.keys(data).length) {
          setForm({
            name: data.name ?? "",
            title: data.title ?? "",
            bio: data.bio ?? "",
            socials: {
              github: data?.socials?.github ?? "",
              linkedin: data?.socials?.linkedin ?? "",
              twitter: data?.socials?.twitter ?? "",
              instagram: data?.socials?.instagram ?? "",
              email: data?.socials?.email ?? "",
              phone: data?.socials?.phone ?? "",
            },
            profileImage: data.profileImage ?? "",
            cloudinaryImageId: data.cloudinaryImageId ?? "",
          });
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ===== Handlers =====
  const updateField =
    (key: keyof Profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const updateSocial =
    (key: keyof Profile["socials"]) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({
        ...prev,
        socials: { ...prev.socials, [key]: e.target.value },
      }));

  const saveProfile = async () => {
    if (!form.name.trim() || !form.title.trim()) {
      alert("Name and Title are required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      alert("✅ Profile saved");
    } catch (e) {
      console.error(e);
      alert("❌ Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ===== Image Upload with Cloudinary =====
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setSelectedImage(f);
    setImagePreview(f ? URL.createObjectURL(f) : null);
  };

  const uploadImage = async () => {
    if (!selectedImage) return alert("Select an image first");
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedImage);
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Upload failed");

      // ✅ Save both URL and public_id to DB
      const put = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileImage: data.path,
          cloudinaryImageId: data.public_id,
        }),
      });
      if (!put.ok) throw new Error("Failed to save image path");

      setForm((p) => ({
        ...p,
        profileImage: data.path,
        cloudinaryImageId: data.public_id,
      }));
      setSelectedImage(null);
      setImagePreview(null);
      alert("✅ Image uploaded & saved");
    } catch (e) {
      console.error(e);
      alert("❌ Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading profile…</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-cyan-400">Profile Management</h1>

      {/* Profile form */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg max-w-3xl space-y-4">
        <h2 className="text-xl font-semibold text-white">General</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Name *</label>
            <input
              value={form.name}
              onChange={updateField("name")}
              className="w-full mt-1 rounded bg-gray-800 border border-gray-700 p-2 text-gray-100"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Title *</label>
            <input
              value={form.title}
              onChange={updateField("title")}
              className="w-full mt-1 rounded bg-gray-800 border border-gray-700 p-2 text-gray-100"
              placeholder="e.g., Full-Stack Developer"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-400">Bio</label>
          <textarea
            value={form.bio}
            onChange={updateField("bio")}
            rows={4}
            className="w-full mt-1 rounded bg-gray-800 border border-gray-700 p-2 text-gray-100"
            placeholder="Short introduction…"
          />
        </div>

        <h2 className="text-xl font-semibold text-white mt-6">Socials</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">GitHub</label>
            <input
              value={form.socials.github || ""}
              onChange={updateSocial("github")}
              className="w-full mt-1 rounded bg-gray-800 border border-gray-700 p-2 text-gray-100"
              placeholder="https://github.com/you"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">LinkedIn</label>
            <input
              value={form.socials.linkedin || ""}
              onChange={updateSocial("linkedin")}
              className="w-full mt-1 rounded bg-gray-800 border border-gray-700 p-2 text-gray-100"
              placeholder="https://linkedin.com/in/you"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Twitter</label>
            <input
              value={form.socials.twitter || ""}
              onChange={updateSocial("twitter")}
              className="w-full mt-1 rounded bg-gray-800 border border-gray-700 p-2 text-gray-100"
              placeholder="https://twitter.com/you"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Instagram</label>
            <input
              value={form.socials.instagram || ""}
              onChange={updateSocial("instagram")}
              className="w-full mt-1 rounded bg-gray-800 border border-gray-700 p-2 text-gray-100"
              placeholder="https://instagram.com/you"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input
              value={form.socials.email || ""}
              onChange={updateSocial("email")}
              className="w-full mt-1 rounded bg-gray-800 border border-gray-700 p-2 text-gray-100"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Phone No</label>
            <input
              value={form.socials.phone || ""}
              onChange={updateSocial("phone")}
              className="w-full mt-1 rounded bg-gray-800 border border-gray-700 p-2 text-gray-100"
              placeholder="+1 555 555 5555"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={saveProfile}
            disabled={saving}
            className="bg-cyan-500 text-black font-semibold px-5 py-2 rounded hover:bg-cyan-400 transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg max-w-3xl space-y-4">
        <h2 className="text-xl font-semibold text-white">Profile Picture</h2>

        {form.profileImage ? (
          <div className="flex items-center gap-4">
            <img
              src={form.profileImage}
              className="w-20 h-20 object-cover rounded border border-gray-700"
              alt="current profile"
            />
            <a
              href={form.profileImage}
              target="_blank"
              className="text-cyan-400 underline"
            >
              View current image
            </a>
          </div>
        ) : (
          <p className="text-gray-400">No image uploaded yet.</p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="block w-full text-sm text-gray-300"
        />

        {imagePreview && (
          <img
            src={imagePreview}
            className="w-20 h-20 object-cover rounded border border-gray-700"
            alt="preview"
          />
        )}

        <button
          onClick={uploadImage}
          disabled={imageUploading || !selectedImage}
          className="bg-cyan-500 text-black font-semibold px-5 py-2 rounded hover:bg-cyan-400 transition disabled:opacity-50"
        >
          {imageUploading ? "Uploading…" : "Upload Image"}
        </button>
      </div>
    </div>
  );
}
