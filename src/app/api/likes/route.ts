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
  const { entryId, thoughtId } = body;

  if (!entryId && !thoughtId) {
    return NextResponse.json({ error: "entryId or thoughtId required" }, { status: 400 });
  }

  if (entryId) {
    const existing = await prisma.like.findUnique({
      where: { userId_entryId: { userId: session.user.id, entryId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }
    await prisma.like.create({ data: { userId: session.user.id, entryId } });

    // Notify the post author (not themselves)
    const entry = await prisma.entry.findUnique({
      where: { id: entryId },
      select: { userId: true, strain: { select: { name: true } } },
    });
    if (entry && entry.userId !== session.user.id) {
      sendPushToUser(entry.userId, {
        title: "💚 New like!",
        body: `${session.user.name ?? "Someone"} liked your ${entry.strain.name} review`,
        url: "/",
      }).catch(() => {}); // fire-and-forget
    }

    return NextResponse.json({ liked: true });
  }

  if (thoughtId) {
    const existing = await prisma.like.findUnique({
      where: { userId_thoughtId: { userId: session.user.id, thoughtId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }
    await prisma.like.create({ data: { userId: session.user.id, thoughtId } });

    // Notify the thought author (not themselves)
    const thought = await prisma.thought.findUnique({
      where: { id: thoughtId },
      select: { userId: true, text: true },
    });
    if (thought && thought.userId !== session.user.id) {
      sendPushToUser(thought.userId, {
        title: "💚 New like!",
        body: `${session.user.name ?? "Someone"} liked your thought`,
        url: "/",
      }).catch(() => {});
    }

    return NextResponse.json({ liked: true });
  }
}
