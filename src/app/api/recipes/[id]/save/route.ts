import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/recipes/[id]/save — toggle save
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id;

  const existing = await prisma.savedRecipe.findUnique({
    where: { userId_recipeId: { userId, recipeId: id } },
  });

  if (existing) {
    await prisma.savedRecipe.delete({ where: { userId_recipeId: { userId, recipeId: id } } });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.savedRecipe.create({ data: { userId, recipeId: id } });
    return NextResponse.json({ saved: true });
  }
}
