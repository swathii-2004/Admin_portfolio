// admin-project/src/app/api/skills/upload/route.ts
import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { checkAuth } from "../../../lib/auth";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const authError = await checkAuth(req);
  if (authError) return authError;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    // ✅ Restrict file types (image only)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "Only image files allowed" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "portfolio/skills", // Organize in folders
          resource_type: "image",
          transformation: [
            { width: 200, height: 200, crop: "fill" }, // Auto-resize for optimization
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    const result = uploadResult as any;

    // ✅ Return Cloudinary URL and public_id
    return NextResponse.json({ 
      success: true, 
      path: result.secure_url,
      public_id: result.public_id // Save this for deletion later
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
  }
}