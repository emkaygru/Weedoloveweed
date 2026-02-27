import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FeedCard from "@/components/FeedCard";
import { prisma } from "@/lib/prisma";

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Update last seen for badge notification tracking
  if (session.user.id) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { lastSeenFeed: new Date() },
    });
  }

  const entries = await prisma.entry.findMany({
    include: {
      user: true,
      strain: true,
      dispensary: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="mb-4 bg-gradient-to-r from-primary to-hybrid bg-clip-text text-2xl font-extrabold text-transparent">
        Weedoloveweed
      </h1>

      {entries.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-4xl">🌿</p>
          <p className="mt-2 font-semibold text-foreground">Nothing here yet</p>
          <p className="text-sm text-muted">
            Be the first to log a session!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const photos = entry.photos as string[] | null;
            return (
              <FeedCard
                key={entry.id}
                id={entry.id}
                userName={entry.user.name ?? "Unknown"}
                userImage={entry.user.image}
                strainName={entry.strain.name}
                strainType={entry.strain.type}
                rating={entry.rating}
                dispensaryName={entry.dispensary?.name}
                photoUrl={photos?.[0]}
                createdAt={entry.createdAt}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
