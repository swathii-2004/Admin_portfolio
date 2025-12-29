import { NextRequest, NextResponse } from "next/server";

export async function checkAuth(request: NextRequest) {
  const isAuthenticated = request.cookies.get("admin_authenticated")?.value === "true";
  
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized - Please login first" },
      { status: 401 }
    );
  }
  
  return null; // Indicates auth passed
}
