import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ count: 0 });

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastSeenFeed: true },
  });

  const since = user?.lastSeenFeed ?? new Date(0);

  const [entryLikes, entryComments, thoughtLikes, thoughtComments] =
    await Promise.all([
      prisma.like.count({
        where: {
          entry: { userId },
          userId: { not: userId },
          createdAt: { gt: since },
        },
      }),
      prisma.comment.count({
        where: {
          entry: { userId },
          userId: { not: userId },
          createdAt: { gt: since },
        },
      }),
      prisma.like.count({
        where: {
          thought: { userId },
          userId: { not: userId },
          createdAt: { gt: since },
        },
      }),
      prisma.comment.count({
        where: {
          thought: { userId },
          userId: { not: userId },
          createdAt: { gt: since },
        },
      }),
    ]);

  return NextResponse.json({
    count: entryLikes + entryComments + thoughtLikes + thoughtComments,
  });
}
