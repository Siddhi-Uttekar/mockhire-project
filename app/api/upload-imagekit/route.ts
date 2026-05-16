import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return NextResponse.json(
      {
        error:
          "Image upload is not configured (missing ImageKit environment variables).",
        missing: {
          NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: !publicKey,
          IMAGEKIT_PRIVATE_KEY: !privateKey,
          NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: !urlEndpoint,
        },
        debug: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          nodeEnv: process.env.NODE_ENV,
        },
      },
      { status: 503 }
    );
  }

  const imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err: any) {
    return NextResponse.json(
      { error: "Invalid multipart form data", details: err?.message },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  const fileName = formData.get("fileName") as string | null;
  const folder = (formData.get("folder") as string | null) || undefined;

  if (!file || !fileName) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const uploadRes = await imagekit.upload({
      file: buffer,
      fileName,
      folder,
    });
    return NextResponse.json({ url: uploadRes.url });
  } catch (err: any) {
    console.error("ImageKit upload failed:", err);
    return NextResponse.json(
      { error: `ImageKit upload failed: ${err.message}` },
      { status: 500 }
    );
  }
}
