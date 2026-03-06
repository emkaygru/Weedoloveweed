import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { entryId, thoughtId, commentId, emoji = "❤️" } = body;

  if (!entryId && !thoughtId && !commentId) {
    return NextResponse.json({ error: "entryId, thoughtId, or commentId required" }, { status: 400 });
  }

  const userId = session.user.id;

  if (entryId) {
    const existing = await prisma.like.findUnique({
      where: { userId_entryId: { userId, entryId } },
    });
    if (existing) {
      if (existing.emoji === emoji) {
        await prisma.like.delete({ where: { id: existing.id } });
        return NextResponse.json({ liked: false, emoji: null });
      }
      const updated = await prisma.like.update({ where: { id: existing.id }, data: { emoji } });
      return NextResponse.json({ liked: true, emoji: updated.emoji });
    }
    const created = await prisma.like.create({ data: { userId, entryId, emoji } });
    return NextResponse.json({ liked: true, emoji: created.emoji });
  }

  if (thoughtId) {
    const existing = await prisma.like.findUnique({
      where: { userId_thoughtId: { userId, thoughtId } },
    });
    if (existing) {
      if (existing.emoji === emoji) {
        await prisma.like.delete({ where: { id: existing.id } });
        return NextResponse.json({ liked: false, emoji: null });
      }
      const updated = await prisma.like.update({ where: { id: existing.id }, data: { emoji } });
      return NextResponse.json({ liked: true, emoji: updated.emoji });
    }
    const created = await prisma.like.create({ data: { userId, thoughtId, emoji } });
    return NextResponse.json({ liked: true, emoji: created.emoji });
  }

  if (commentId) {
    const existing = await prisma.like.findUnique({
      where: { userId_commentId: { userId, commentId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }
    await prisma.like.create({ data: { userId, commentId, emoji: "❤️" } });
    return NextResponse.json({ liked: true });
  }
}
