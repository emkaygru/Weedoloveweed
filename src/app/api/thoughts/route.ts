import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    include: {
      user: true,
      strain: true,
    },
  });

  return NextResponse.json(thought);
}
