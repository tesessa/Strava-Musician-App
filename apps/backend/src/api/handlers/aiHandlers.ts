import { NextResponse } from "next/server";

export async function analyzeAudio(req: Request) {
  try {
    const body = await req.json();
    const { fileUrl } = body ?? {};
    if (!fileUrl) {
      return NextResponse.json({ error: "fileUrl is required" }, { status: 400 });
    }

    // Call the AI service
    const aiResponse = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_url: fileUrl }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json({ error: "AI service error" }, { status: 502 });
    }

    const aiResult = await aiResponse.json();
    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("Error in analyzeAudio handler:", error);
    return NextResponse.json({ error: "internal_server_error" }, { status: 500 });
  }
}