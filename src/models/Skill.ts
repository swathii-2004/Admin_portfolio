// admin-project/src/models/Skill.ts
import mongoose, { Schema, models } from "mongoose";

const SkillSchema = new Schema(
  {
    name: { type: String, required: true },
    category: { type: String, default: "" },
    level: { type: String, default: "" },
    imageURL: { type: String, default: "" },
    cloudinaryPublicId: { type: String, default: "" }, // ✅ Added for deletion
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Skill = models.Skill || mongoose.model("Skill", SkillSchema);
export default Skill;