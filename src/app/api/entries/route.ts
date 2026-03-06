import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendPushToAllExcept } from "@/lib/push";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { strainId, rating, review, feelings, brand, dispensaryName, method, gifUrl, photos } = body;

  if (!strainId || !rating) {
    return NextResponse.json({ error: "Strain and rating required" }, { status: 400 });
  }

  // Handle dispensary — find or create by name
  let dispensaryId: string | undefined;
  if (dispensaryName?.trim()) {
    const existing = await prisma.dispensary.findFirst({
      where: { name: { equals: dispensaryName.trim(), mode: "insensitive" } },
    });
    if (existing) {
      dispensaryId = existing.id;
    } else {
      const created = await prisma.dispensary.create({
        data: { name: dispensaryName.trim() },
      });
      dispensaryId = created.id;
    }
  }

  const entry = await prisma.entry.create({
    data: {
      userId: session.user.id,
      strainId,
      dispensaryId,
      rating: Math.min(5, Math.max(1, Number(rating))),
      review: review?.trim() || null,
      feelings: feelings?.length ? feelings : null,
      brand: brand?.trim() || null,
      method: method || null,
      gifUrl: gifUrl?.trim() || null,
      photos: photos?.length ? photos : null,
    },
    include: { strain: true, user: true },
  });

  // Notify everyone else about the new review
  sendPushToAllExcept(session.user.id, {
    title: "🌿 New review!",
    body: `${session.user.name ?? "Someone"} reviewed ${entry.strain.name}`,
    url: "/",
  }).catch(() => {});

  return NextResponse.json(entry);
}
