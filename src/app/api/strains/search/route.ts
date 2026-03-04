import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { BUILT_IN_STRAINS } from "@/data/strains";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const lowerQuery = query.toLowerCase();

  // Search local database (user-created strains + any previously saved)
  const localResults = await prisma.strain.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  // Search built-in strain dataset
  const builtInResults = BUILT_IN_STRAINS.filter((s) =>
    s.name.toLowerCase().includes(lowerQuery)
  )
    .slice(0, 10)
    .map((s) => ({
      name: s.name,
      type: s.type,
      description: s.description,
      thcPercent: s.thcPercent,
      cbdPercent: s.cbdPercent,
      effects: s.effects,
      flavors: s.flavors,
      terpeneProfile: s.terpeneProfile,
      builtIn: true,
    }));

  // Deduplicate — prefer local DB results over built-in
  const localNames = new Set(localResults.map((s) => s.name.toLowerCase()));
  const merged = [
    ...localResults.map((s) => ({ ...s, external: false })),
    ...builtInResults.filter((s) => !localNames.has(s.name.toLowerCase())),
  ];

  return NextResponse.json({ results: merged });
}
