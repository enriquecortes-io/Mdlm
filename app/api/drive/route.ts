import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import sharp from "sharp";

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function getAuth() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return new google.auth.GoogleAuth({
      credentials: JSON.parse(json),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
  }
  return new google.auth.GoogleAuth({
    credentials: {
      type: "service_account",
      private_key: (process.env.GOOGLE_DRIVE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });
}

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return new NextResponse("Missing id", { status: 400 });

    const auth = getAuth();
    const drive = google.drive({ version: "v3", auth });

    const meta = await drive.files.get({ fileId: id, fields: "mimeType,size" });
    const mimeType = meta.data.mimeType || "application/octet-stream";
    const fileSize = parseInt(meta.data.size || "0");

    const isVideo = mimeType.startsWith("video");
    const rangeHeader = req.headers.get("range");

    // Para video en iOS Safari: SIEMPRE responder 206 con Range, incluso sin header range
    if (isVideo && fileSize > 0) {
      let start = 0;
      let end = fileSize - 1;

      if (rangeHeader) {
        const parts = rangeHeader.replace(/bytes=/, "").split("-");
        start = parseInt(parts[0]) || 0;
        end = parts[1] ? parseInt(parts[1]) : fileSize - 1;
      }
      const chunkSize = end - start + 1;

      const response = await drive.files.get(
        { fileId: id, alt: "media" },
        { responseType: "stream", headers: { Range: `bytes=${start}-${end}` } }
      );

      return new NextResponse(response.data as any, {
        status: 206,
        headers: {
          "Content-Type": mimeType,
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Cache-Control": "public, max-age=2592000",
        },
      });
    }

    // Imágenes: redimensionar + convertir a WebP on-the-fly (peso real reducido)
    const isImage = mimeType.startsWith("image");
    const widthParam = req.nextUrl.searchParams.get("w");
    const targetWidth = widthParam ? parseInt(widthParam) : null;

    if (isImage) {
      const response = await drive.files.get(
        { fileId: id, alt: "media" },
        { responseType: "stream" }
      );
      const buffer = await streamToBuffer(response.data as any);

      let pipeline = sharp(buffer).rotate(); // rotate() respeta el EXIF orientation
      if (targetWidth && targetWidth > 0 && targetWidth < 4000) {
        pipeline = pipeline.resize({ width: targetWidth, withoutEnlargement: true });
      } else {
        // Sin parametro w: limitamos a un maximo razonable (evita servir 6000px de Drive)
        pipeline = pipeline.resize({ width: 1600, withoutEnlargement: true });
      }
      const webpBuffer = await pipeline.webp({ quality: 78 }).toBuffer();

      return new NextResponse(new Uint8Array(webpBuffer), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=2592000, immutable",
        },
      });
    }

    // Otros archivos (no imagen, no video): se sirven tal cual
    const response = await drive.files.get(
      { fileId: id, alt: "media" },
      { responseType: "stream" }
    );

    return new NextResponse(response.data as any, {
      headers: {
        "Content-Type": mimeType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=2592000",
      },
    });

  } catch (e: any) {
    console.error("[drive]", e instanceof Error ? e.message : "Unknown error");
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
