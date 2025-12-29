
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Project from "@/models/Project";
import { checkAuth } from "../../lib/auth";

// GET /api/projects - Fetch all projects (public for dashboard)
export async function GET() {
  try {
    await connectDB();
    const projects = await Project.find({}).sort({ createdAt: -1 });
    return NextResponse.json(projects);
  } catch (err) {
    console.error("GET /projects error:", err);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project (protected)
export async function POST(req: NextRequest) {
  const authError = await checkAuth(req);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await req.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const newProject = await Project.create({
      title: body.title,
      description: body.description || "",
      imageURL: body.imageURL || "",
      images: Array.isArray(body.images) ? body.images : [],
      githubLink: body.githubLink || "",
      liveLink: body.liveLink || "",
      techStack: Array.isArray(body.techStack) ? body.techStack : [],
      category: body.category || "",
      featured: !!body.featured,
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (err) {
    console.error("POST /projects error:", err);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}