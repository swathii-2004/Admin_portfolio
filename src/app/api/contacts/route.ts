import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb";
import Contact from "@/models/Contact";

// ✅ GET all contact messages (for admin)
export async function GET() {
  try {
    await connectDB();
    const messages = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json(messages);
  } catch (err) {
    console.error("GET /contacts error:", err);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}
