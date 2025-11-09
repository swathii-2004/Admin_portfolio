import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import Contact from "@/models/Contact";
import mongoose from "mongoose";

// ✅ Mark as Read
export async function PUT(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    const updated = await Contact.findByIdAndUpdate(id, { isRead: true }, { new: true });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PUT /contacts/:id error:", err);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}

// ✅ Delete Message
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await Contact.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /contacts/:id error:", err);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
