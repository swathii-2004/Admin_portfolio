import { NextResponse, NextRequest } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Contact from "@/models/Contact";
import mongoose from "mongoose";
import { checkAuth } from "../../../lib/auth";

// ✅ Mark as Read (protected)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await checkAuth(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params; // ✅ Await params
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const updated = await Contact.findByIdAndUpdate(id, { isRead: true }, { new: true });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /contacts/:id error:", err);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}

// ✅ Delete Message (protected)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await checkAuth(req);
  if (authError) return authError;

  try {
    await connectDB();
    const { id } = await params; // ✅ Await params
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await Contact.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /contacts/:id error:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}