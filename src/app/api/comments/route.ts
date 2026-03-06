import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendPushToUser } from "@/lib/push";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entryId, thoughtId, parentId, text, gifUrl } = body;

  if (!entryId && !thoughtId && !parentId) {
    return NextResponse.json({ error: "entryId, thoughtId, or parentId required" }, { status: 400 });
  }

  if (!text?.trim() && !gifUrl?.trim()) {
    return NextResponse.json({ error: "Text or GIF required" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      userId: session.user.id,
      entryId: entryId || null,
      thoughtId: thoughtId || null,
      parentId: parentId || null,
      text: text?.trim() || "",
      gifUrl: gifUrl?.trim() || null,
    },
    include: {
      user: { select: { name: true, image: true } },
      likes: { select: { userId: true } },
      replies: {
        include: {
          user: { select: { name: true, image: true } },
          likes: { select: { userId: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  // Notify post/thought author (not themselves)
  if (entryId) {
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { userId: true, strain: { select: { name: true } } },
    });
    if (entry && entry.userId !== session.user.id) {
      sendPushToUser(entry.userId, {
        title: "💬 New comment!",
        body: `${session.user.name ?? "Someone"} commented on your ${entry.strain.name} review`,
        url: "/",
      }).catch(() => {});
    }
  }

  if (thoughtId) {
    const thought = await prisma.thought.findUnique({
      where: { id: thoughtId },
      select: { userId: true },
    });
    if (thought && thought.userId !== session.user.id) {
      sendPushToUser(thought.userId, {
        title: "💬 New comment!",
        body: `${session.user.name ?? "Someone"} commented on your thought`,
        url: "/",
      }).catch(() => {});
    }
  }

  return NextResponse.json(comment);
}
