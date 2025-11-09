// admin-project/src/models/Profile.ts
import { Schema, model, models } from "mongoose";

const WorkExperienceSchema = new Schema({
  company: String,
  position: String,
  duration: String,
  description: String,
});

const EducationSchema = new Schema({
  institution: String,
  degree: String,
  year: String,
  description: String,
});

const ProfileSchema = new Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    bio: String,
    profileImage: String, // Cloudinary URL
    cloudinaryImageId: String, // For deletion
    socials: {
      github: String,
      linkedin: String,
      twitter: String,
      instagram: String,
      email: String,
      phone: String,
    },
    workExperience: [WorkExperienceSchema],
    education: [EducationSchema],
    certifications: [String],
  },
  { timestamps: true }
);

export default models.Profile || model("Profile", ProfileSchema);