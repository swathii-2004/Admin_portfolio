// src/app/api/skills/route.ts
import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Skill from "@/models/Skill";
import { checkAuth } from "../../lib/auth";

export async function GET() {
  try {
    await connectDB();
    const skills = await Skill.find().sort({ createdAt: -1 });
    return NextResponse.json(skills);
  } catch (err) {
    console.error("GET /skills error:", err);
    return NextResponse.json({ error: "Failed to load skills" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await checkAuth(req);
  if (authError) return authError;

  try {
    await connectDB();
    const body = await req.json();

    const skill = await Skill.create({
      name: body.name,
      category: body.category || "",
      level: body.level || "",
      imageURL: body.imageURL || "",
      featured: !!body.featured,
    });

    return NextResponse.json(skill, { status: 201 });
  } catch (err) {
    console.error("POST /skills error:", err);
    return NextResponse.json({ error: "Failed to create skill" }, { status: 500 });
  }
}
