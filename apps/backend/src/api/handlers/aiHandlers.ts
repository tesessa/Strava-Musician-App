import { NextResponse } from "next/server";

export async function analyzeAudio(req: Request) {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL ?? "http://localhost:8000";
    const contentType = req.headers.get("content-type") ?? "";

    let aiResponse: Response;
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "file is required" }, { status: 400 });
      }

      const outboundForm = new FormData();
      outboundForm.append("file", file, file.name);

      aiResponse = await fetch(`${aiServiceUrl}/analyze-file`, {
        method: "POST",
        body: outboundForm,
      });
    } else {
      const body = await req.json();
      const { fileUrl } = body ?? {};
      if (!fileUrl) {
        return NextResponse.json({ error: "fileUrl is required" }, { status: 400 });
      }

      aiResponse = await fetch(`${aiServiceUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_url: fileUrl }),
      });
    }

    if (!aiResponse.ok) {
      const details = await aiResponse.text();
      return NextResponse.json(
        { error: "AI service error", details },
        { status: 502 },
      );
    }

    const aiResult = await aiResponse.json();
    return NextResponse.json(aiResult);
  } catch (error) {
    console.error("Error in analyzeAudio handler:", error);
    return NextResponse.json({ error: "internal_server_error" }, { status: 500 });
  }
}