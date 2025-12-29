// admin-project/src/app/api/projects/upload/route.ts
import { NextResponse, NextRequest } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { checkAuth } from "../../../lib/auth";

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
    
    // Support both `files` (multiple) and `file` (single)
    let files = formData.getAll("files") as File[];
    const single = formData.get("file") as File | null;
    if ((!files || files.length === 0) && single) {
      files = [single];
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files uploaded" },
        { status: 400 }
      );
    }

    // Validate file types
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "Only image files allowed" },
          { status: 400 }
        );
      }
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: "portfolio/projects",
            resource_type: "image",
            transformation: [
              { width: 1200, height: 800, crop: "limit" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
    });

    const results = await Promise.all(uploadPromises);
    
    const uploadedFiles = results.map((result: any) => ({
      url: result.secure_url,
      public_id: result.public_id,
    }));

    return NextResponse.json({
      success: true,
      paths: uploadedFiles.map(f => f.url),
      publicIds: uploadedFiles.map(f => f.public_id),
    });
  } catch (err) {
    console.error("Cloudinary project upload error:", err);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}