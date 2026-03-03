import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, description, thcPercent, cbdPercent, effects, flavors } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check if strain exists
  const existing = await prisma.strain.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(existing);
  }

  const strain = await prisma.strain.create({
    data: {
      name: name.trim(),
      slug,
      type: type || "hybrid",
      description: description?.trim() || null,
      thcPercent: thcPercent ? Number(thcPercent) : null,
      cbdPercent: cbdPercent ? Number(cbdPercent) : null,
      effects: effects?.length ? effects : null,
      flavors: flavors?.length ? flavors : null,
      isUserCreated: true,
    },
  });

  return NextResponse.json(strain);
}
