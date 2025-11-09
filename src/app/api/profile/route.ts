// admin-project/src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "../../lib/mongodb"; // keep your existing path
import Profile from "@/models/Profile";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ GET: Fetch single profile
export async function GET() {
  try {
    await connectDB();
    const profile = await Profile.findOne();
    return NextResponse.json(profile || {});
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// ✅ POST: Create new profile
export async function POST(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const socials = {
      github: data?.socials?.github || "",
      linkedin: data?.socials?.linkedin || "",
      twitter: data?.socials?.twitter || "",
      instagram: data?.socials?.instagram || "", // <-- added
      email: data?.socials?.email || "",
      phone: data?.socials?.phone || "",
    };

    const profile = await Profile.create({
      name: data.name,
      title: data.title,
      bio: data.bio || "",
      socials,
      profileImage: data.profileImage || "",
      cloudinaryImageId: data.cloudinaryImageId || "",
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

// ✅ PUT: Update existing profile (partial update)
export async function PUT(req: Request) {
  try {
    await connectDB();
    const data = await req.json();

    const existingProfile = await Profile.findOne();
    if (!existingProfile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    // Delete old profile image from Cloudinary if replacing
    if (
      data.cloudinaryImageId &&
      existingProfile.cloudinaryImageId &&
      data.cloudinaryImageId !== existingProfile.cloudinaryImageId
    ) {
      try {
        await cloudinary.uploader.destroy(existingProfile.cloudinaryImageId);
        console.log(
          "✅ Deleted old profile image:",
          existingProfile.cloudinaryImageId
        );
      } catch (err) {
        console.error("❌ Failed to delete old profile image:", err);
      }
    }

    // Build update object (only provided fields)
    const updateFields: any = {};

    if (data.name !== undefined) updateFields.name = data.name;
    if (data.title !== undefined) updateFields.title = data.title;
    if (data.bio !== undefined) updateFields.bio = data.bio;

    if (data.socials !== undefined) {
      updateFields.socials = {
        github: data.socials?.github || "",
        linkedin: data.socials?.linkedin || "",
        twitter: data.socials?.twitter || "",
        instagram: data.socials?.instagram || "", // <-- added
        email: data.socials?.email || "",
        phone: data.socials?.phone || "",
      };
    }

    if (data.profileImage !== undefined)
      updateFields.profileImage = data.profileImage;
    if (data.cloudinaryImageId !== undefined)
      updateFields.cloudinaryImageId = data.cloudinaryImageId;

    updateFields.updatedAt = new Date();

    const updated = await Profile.findOneAndUpdate(
      {},
      { $set: updateFields },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
