// admin-project/src/app/api/skills/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Skill from "@/models/Skill";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  try {
    await connectDB();
    const { id } = await params; // ✅ Await params
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    
    // ✅ If new image uploaded, delete old one from Cloudinary
    if (body.cloudinaryPublicId) {
      const existingSkill = await Skill.findById(id);
      if (existingSkill?.cloudinaryPublicId && existingSkill.cloudinaryPublicId !== body.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(existingSkill.cloudinaryPublicId);
        } catch (cloudinaryError) {
          console.error("Cloudinary delete old image error:", cloudinaryError);
        }
      }
    }

    const updated = await Skill.findByIdAndUpdate(
      id,
      {
        $set: {
          name: body.name,
          category: body.category || "",
          level: body.level || "",
          imageURL: body.imageURL || "",
          cloudinaryPublicId: body.cloudinaryPublicId || "",
          featured: !!body.featured,
        },
      },
      { new: true }
    );

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /skills/:id error:", err);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ Changed to Promise
) {
  try {
    await connectDB();
    const { id } = await params; // ✅ Await params
    
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // ✅ Get skill to delete image from Cloudinary
    const skill = await Skill.findById(id);
    
    if (skill?.cloudinaryPublicId) {
      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(skill.cloudinaryPublicId);
        console.log("✅ Deleted from Cloudinary:", skill.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary delete error:", cloudinaryError);
        // Continue with DB deletion even if Cloudinary fails
      }
    }

    await Skill.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /skills/:id error:", err);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}