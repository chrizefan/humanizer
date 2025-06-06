import { NextRequest, NextResponse } from "next/server";
import { getUserProjects } from "@/lib/supabase";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  return requireAuth(request, async (req, user) => {
    try {
      // Get pagination parameters from the request URL
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
      
      // Fetch projects
      const { data, count } = await getUserProjects(page, pageSize);
      
      // Calculate total pages (handle case where count is 0)
      const totalPages = count > 0 ? Math.ceil(count / pageSize) : 1;
      
      // Return successful response
      return NextResponse.json({
        success: true,
        data: data || [], // Ensure we always return an array, even if empty
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages
        }
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      
      return NextResponse.json(
        { success: false, error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}