// admin-project/src/models/Project.ts
import mongoose, { Schema, models } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    category: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    imageURL: { type: String, default: "" }, // First image (thumbnail)
    images: { type: [String], default: [] }, // All image URLs from Cloudinary
    cloudinaryPublicIds: { type: [String], default: [] }, // ✅ For deletion
    githubLink: { type: String, default: "" },
    liveLink: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Project = models.Project || mongoose.model("Project", ProjectSchema);
export default Project;