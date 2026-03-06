import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendPushToAllExcept } from "@/lib/push";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { text, strainId, gifUrl } = body;

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const thought = await prisma.thought.create({
    data: {
      userId: session.user.id,
      text: text.trim(),
      strainId: strainId || null,
      gifUrl: gifUrl?.trim() || null,
    },
    include: { user: true, strain: true },
  });

  // Notify everyone else about the new thought
  sendPushToAllExcept(session.user.id, {
    title: "💭 New thought!",
    body: `${session.user.name ?? "Someone"} posted: ${text.trim().slice(0, 80)}${text.length > 80 ? "…" : ""}`,
    url: "/",
  }).catch(() => {});

  return NextResponse.json(thought);
}
