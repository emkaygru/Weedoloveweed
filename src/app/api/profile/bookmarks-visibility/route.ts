import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { isPublic } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { bookmarksPublic: isPublic },
    select: { bookmarksPublic: true },
  });

  return NextResponse.json({ bookmarksPublic: user.bookmarksPublic });
}
