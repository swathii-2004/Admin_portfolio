"use client";

import { useEffect, useState } from "react";

type Project = {
  _id: string;
  title: string;
  description?: string;
  imageURL?: string;
  images?: string[];
  cloudinaryPublicIds?: string[]; // ✅ Added
  githubLink?: string;
  liveLink?: string;
  techStack: string[];
  category?: string;
  featured?: boolean;
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [category, setCategory] = useState("");
  const [techStack, setTechStack] = useState("");
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [publicIds, setPublicIds] = useState<string[]>([]); // ✅ Track Cloudinary IDs
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(Array.isArray(data) ? data : []);
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setTitle(project.title);
      setDescription(project.description || "");
      setGithubLink(project.githubLink || "");
      setLiveLink(project.liveLink || "");
      setCategory(project.category || "");
      setTechStack(project.techStack?.join(", ") || "");
      setFeatured(project.featured || false);
      setImages(project.images || []);
      setPublicIds(project.cloudinaryPublicIds || []); // ✅ Load existing IDs
      setImagePreviews(project.images || []);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingProject(null);
    setTitle("");
    setDescription("");
    setGithubLink("");
    setLiveLink("");
    setCategory("");
    setTechStack("");
    setFeatured(false);
    setImages([]);
    setPublicIds([]); // ✅ Reset
    setImageFiles([]);
    setImagePreviews([]);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = imagePreviews.length + files.length;

    if (totalImages > 4) {
      alert("Maximum 4 images allowed!");
      return;
    }

    // Create preview URLs for new files
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    // If it's an existing Cloudinary image
    if (index < images.length) {
      setImages((prev) => prev.filter((_, i) => i !== index));
      setPublicIds((prev) => prev.filter((_, i) => i !== index)); // ✅ Remove ID too
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // If it's a new file not yet uploaded
      const fileIndex = index - images.length;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= imagePreviews.length) return;

    const swap = <T,>(arr: T[]) => {
      const newArr = [...arr];
      [newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]];
      return newArr;
    };

    setImagePreviews(swap(imagePreviews));

    // Reorder within existing images
    if (index < images.length && newIndex < images.length) {
      setImages(swap(images));
      setPublicIds(swap(publicIds)); // ✅ Keep IDs in sync
    }
    // Reorder within new files
    else if (index >= images.length && newIndex >= images.length) {
      setImageFiles(swap(imageFiles));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required!");
      return;
    }

    setUploading(true);

    try {
      let finalImages = [...images];
      let finalPublicIds = [...publicIds]; // ✅ Track IDs

      // Upload new images to Cloudinary if any
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("files", file));

        const uploadRes = await fetch("/api/projects/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        
        if (uploadData.success && uploadData.paths && uploadData.publicIds) {
          finalImages = [...finalImages, ...uploadData.paths];
          finalPublicIds = [...finalPublicIds, ...uploadData.publicIds]; // ✅ Store IDs
        } else {
          alert(uploadData?.error || "Upload failed");
          setUploading(false);
          return;
        }
      }

      const projectData = {
        title,
        description,
        imageURL: finalImages[0] || "", // First image as thumbnail
        images: finalImages,
        cloudinaryPublicIds: finalPublicIds, // ✅ Send to API
        githubLink,
        liveLink,
        techStack: techStack
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        category,
        featured,
      };

      const url = editingProject
        ? `/api/projects/${editingProject._id}`
        : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectData),
      });

      if (res.ok) {
        await fetchProjects();
        closeModal();
      } else {
        alert("Failed to save project");
      }
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Error saving project");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchProjects();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">Admin - Projects</h1>
          <button
            onClick={() => openModal()}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 py-3 rounded-lg"
          >
            + Add Project
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
            >
              {(project.images?.[0] || project.imageURL) && (
                <img
                  src={project.images?.[0] || project.imageURL}
                  alt={project.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {project.description}
                </p>
                {project.images && project.images.length > 1 && (
                  <p className="text-cyan-400 text-xs mb-3">
                    📷 {project.images.length} images
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(project)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gray-900 rounded-xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Images Upload Section */}
                <div>
                  <label className="block text-gray-300 mb-2 font-semibold">
                    Images (Max 4) - First image is the thumbnail ⭐
                  </label>

                  {/* Image Previews */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-700"
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-cyan-500 text-black text-xs px-2 py-1 rounded font-bold">
                            MAIN
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, "up")}
                              className="bg-blue-500 text-white p-1 rounded text-xs"
                            >
                              ←
                            </button>
                          )}
                          {index < imagePreviews.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, "down")}
                              className="bg-blue-500 text-white p-1 rounded text-xs"
                            >
                              →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="bg-red-500 text-white p-1 rounded text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {imagePreviews.length < 4 && (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
                        <p className="text-gray-400">
                          Click to upload images ({4 - imagePreviews.length}{" "}
                          remaining)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Web App, Mobile, etc."
                    className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">GitHub Link</label>
                    <input
                      type="url"
                      value={githubLink}
                      onChange={(e) => setGithubLink(e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Live Link</label>
                    <input
                      type="url"
                      value={liveLink}
                      onChange={(e) => setLiveLink(e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Featured Project
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading
                      ? "Saving..."
                      : editingProject
                      ? "Update Project"
                      : "Create Project"}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={uploading}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}