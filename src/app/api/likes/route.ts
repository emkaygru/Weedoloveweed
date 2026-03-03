import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

  // Toggle like
  if (entryId) {
    const existing = await prisma.like.findUnique({
      where: { userId_entryId: { userId: session.user.id, entryId } },
    });
    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }
    await prisma.like.create({
      data: { userId: session.user.id, entryId },
    });
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
    await prisma.like.create({
      data: { userId: session.user.id, thoughtId },
    });
    return NextResponse.json({ liked: true });
  }
}
