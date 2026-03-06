import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/recipes?q=...&category=...
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  const recipes = await prisma.recipe.findMany({
    where: {
      AND: [
        category ? { category } : {},
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    },
    include: {
      saves: { where: { userId: session.user.id }, select: { userId: true } },
    },
    orderBy: [{ isBuiltIn: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(
    recipes.map((r) => ({ ...r, saved: r.saves.length > 0, saves: undefined }))
  );
}

// POST /api/recipes — create a recipe
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, category, description, ingredients, instructions, servings, mgThcTotal, notes } =
    body;

  if (!title || !category || !ingredients?.length || !instructions?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      authorId: session.user.id,
      title,
      category,
      description: description || null,
      ingredients,
      instructions,
      servings: servings ? parseInt(servings) : null,
      mgThcTotal: mgThcTotal ? parseFloat(mgThcTotal) : null,
      notes: notes || null,
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
