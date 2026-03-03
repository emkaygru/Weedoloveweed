import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { strainId, listType } = body;

  if (!strainId || !listType) {
    return NextResponse.json({ error: "strainId and listType required" }, { status: 400 });
  }

  if (!["favorites", "want_to_try"].includes(listType)) {
    return NextResponse.json({ error: "Invalid listType" }, { status: 400 });
  }

  // Toggle bookmark
  const existing = await prisma.bookmark.findUnique({
    where: {
      userId_strainId_listType: {
        userId: session.user.id,
        strainId,
        listType,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.bookmark.create({
    data: {
      userId: session.user.id,
      strainId,
      listType,
    },
  });

  return NextResponse.json({ bookmarked: true });
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const listType = searchParams.get("listType") || "want_to_try";

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId: session.user.id,
      listType,
    },
    include: { strain: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookmarks });
}
