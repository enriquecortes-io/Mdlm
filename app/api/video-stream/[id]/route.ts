import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Construir URL de Drive con export=download para mejor streaming
  const driveUrl = `https://drive.google.com/uc?id=${id}&export=download`;
  
  try {
    const response = await fetch(driveUrl, {
      headers: {
        "Range": request.headers.get("Range") || "",
        "User-Agent": "Mozilla/5.0",
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: "Video not found" },
        { status: response.status }
      );
    }
    
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "video/webm",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        "Accept-Ranges": "bytes",
        "Content-Length": response.headers.get("Content-Length") || "",
        "Content-Range": response.headers.get("Content-Range") || "",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch video" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const maxDuration = 60;
