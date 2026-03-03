import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entryId, thoughtId, text, gifUrl } = body;

  if (!entryId && !thoughtId) {
    return NextResponse.json({ error: "entryId or thoughtId required" }, { status: 400 });
  }

  if (!text?.trim() && !gifUrl?.trim()) {
    return NextResponse.json({ error: "Text or GIF required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      entryId: entryId || null,
      thoughtId: thoughtId || null,
      text: text?.trim() || "",
      gifUrl: gifUrl?.trim() || null,
    },
    include: {
      user: true,
    },
  });

  return NextResponse.json(comment);
}
