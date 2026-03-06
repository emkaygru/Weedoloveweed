import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET — current active break + history
export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [active, history] = await Promise.all([
    prisma.tBreak.findFirst({
      where: { userId, endedAt: null },
      orderBy: { startedAt: "desc" },
    }),
    prisma.tBreak.findMany({
      where: { userId, endedAt: { not: null } },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({ active, history });
}

// POST — start a new break
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { goalDays } = await request.json().catch(() => ({}));

  // End any existing active break first
  await prisma.tBreak.updateMany({
    where: { userId: session.user.id, endedAt: null },
    data: { endedAt: new Date() },
  });

  const tBreak = await prisma.tBreak.create({
    data: {
      userId: session.user.id,
      goalDays: goalDays ? Number(goalDays) : null,
    },
  });

  return NextResponse.json(tBreak);
}

// PATCH — end the current break
export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.tBreak.updateMany({
    where: { userId: session.user.id, endedAt: null },
    data: { endedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
