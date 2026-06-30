import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Construir URL de Drive con export=download para mejor streaming
  const driveUrl = `https://drive.google.com/uc?id=${id}&export=download`;
  
  try {
    const response = await fetch(driveUrl, {
      headers: {
        "Range": request.headers.get("Range") || "",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,*/*;q=0.6",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://drive.google.com/",
        "Origin": "https://drive.google.com",
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
