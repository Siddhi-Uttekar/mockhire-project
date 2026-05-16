import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    },
  });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await context.params;
  const finalPath = path?.length ? path.join("/") : "call/web";
  const url = `https://api.vapi.ai/${finalPath}`;

  // Debug: verify API key is loaded
  console.log("[VAPI Proxy] Key exists:", !!process.env.VAPI_API_KEY);

  const body = await req.text();

  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") || "application/json",
  };

  // Use public API key with Authorization: Bearer header for call/web endpoint
  if (process.env.VAPI_PUBLIC_KEY) {
    headers["Authorization"] = `Bearer ${process.env.VAPI_PUBLIC_KEY}`;
  }

  console.log("[VAPI Proxy] Key exists:", !!process.env.VAPI_API_KEY);
  console.log("[VAPI Proxy] Sending request to:", url);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "application/json";

    if (res.status !== 200) {
      console.log("[VAPI Proxy] Error:", res.status, text);
    }

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    // Return a generic 502 with the error message
    return new NextResponse(JSON.stringify({ error: (err as Error)?.message || String(err) }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ path?: string[] }> }
) {
  const { path } = await context.params;
  const finalPath = path?.length ? path.join("/") : "";
  const url = `https://api.vapi.ai/${finalPath}`;

  const headers: Record<string, string> = {};
  if (process.env.VAPI_PUBLIC_KEY) {
    headers["Authorization"] = `Bearer ${process.env.VAPI_PUBLIC_KEY}`;
  }

  try {
    const res = await fetch(url, { method: "GET", headers });
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "application/json";
    return new NextResponse(text, { status: res.status, headers: { "Content-Type": contentType } });
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: (err as Error)?.message || String(err) }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}
