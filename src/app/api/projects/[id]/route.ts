// admin-project/src/app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Project from "@/models/Project";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET /api/projects/:id - Fetch single project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (err) {
    console.error("GET /projects/:id error:", err);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// PUT /api/projects/:id - Update project
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    // Delete old images from Cloudinary if new ones are uploaded
    if (body.cloudinaryPublicIds && Array.isArray(body.cloudinaryPublicIds)) {
      const existingProject = await Project.findById(id);
      
      if (existingProject?.cloudinaryPublicIds) {
        // Find images that were removed
        const removedIds = existingProject.cloudinaryPublicIds.filter(
          (oldId: string) => !body.cloudinaryPublicIds.includes(oldId)
        );

        // Delete removed images from Cloudinary
        for (const publicId of removedIds) {
          try {
            await cloudinary.uploader.destroy(publicId);
            console.log("✅ Deleted from Cloudinary:", publicId);
          } catch (cloudinaryError) {
            console.error("❌ Cloudinary delete error:", cloudinaryError);
          }
        }
      }
    }

    const updated = await Project.findByIdAndUpdate(
      id,
      {
        $set: {
          title: body.title,
          description: body.description || "",
          category: body.category || "",
          techStack: Array.isArray(body.techStack) ? body.techStack : [],
          imageURL: body.imageURL || "",
          images: Array.isArray(body.images) ? body.images : [],
          cloudinaryPublicIds: Array.isArray(body.cloudinaryPublicIds)
            ? body.cloudinaryPublicIds
            : [],
          githubLink: body.githubLink || "",
          liveLink: body.liveLink || "",
          featured: !!body.featured,
        },
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /projects/:id error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/projects/:id - Delete project
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const project = await Project.findById(id);

    // Delete all images from Cloudinary
    if (project?.cloudinaryPublicIds && project.cloudinaryPublicIds.length > 0) {
      for (const publicId of project.cloudinaryPublicIds) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log("✅ Deleted from Cloudinary:", publicId);
        } catch (cloudinaryError) {
          console.error("❌ Cloudinary delete error:", cloudinaryError);
        }
      }
    }

    await Project.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /projects/:id error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}