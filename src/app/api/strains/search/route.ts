import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Otreeba Open Cannabis API for external strain data
const OTREEBA_API = "https://api.otreeba.com/cannabisreports/v1.0a/strains";

interface ExternalStrain {
  name: string;
  ucpc?: string;
  genetics?: { names?: string };
  lineage?: Record<string, string>;
  image?: string;
}

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

  // Search local database
  const localResults = await prisma.strain.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
    },
    take: 10,
    orderBy: { name: "asc" },
  });

  // Try external API (non-blocking, graceful fallback)
  let externalResults: Array<{
    name: string;
    type: string;
    description: string | null;
    external: boolean;
    apiSourceId: string | null;
    imageUrl: string | null;
  }> = [];

  try {
    const res = await fetch(
      `${OTREEBA_API}?search=${encodeURIComponent(query)}&page=0&count=10`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
        externalResults = data.data.map((s: ExternalStrain) => ({
          name: s.name,
          type: "hybrid",
          description: s.genetics?.names || null,
          external: true,
          apiSourceId: s.ucpc || null,
          imageUrl: s.image || null,
        }));
      }
    }
  } catch {
    // External API failed, continue with local results only
  }

  // Deduplicate — prefer local results
  const localNames = new Set(localResults.map((s) => s.name.toLowerCase()));
  const merged = [
    ...localResults.map((s) => ({ ...s, external: false })),
    ...externalResults.filter((s) => !localNames.has(s.name.toLowerCase())),
  ];

  return NextResponse.json({ results: merged });
}
