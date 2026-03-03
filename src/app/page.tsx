import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import FeedCard from "@/components/FeedCard";
import ThoughtCard from "@/components/ThoughtCard";
import FABMenu from "@/components/FABMenu";
import { prisma } from "@/lib/prisma";

type FeedItem =
  | { type: "entry"; createdAt: Date; data: EntryData }
  | { type: "thought"; createdAt: Date; data: ThoughtData };

interface EntryData {
  id: string;
  rating: number;
  method: string | null;
  review: string | null;
  gifUrl: string | null;
  photos: unknown;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null };
  strain: { name: string; type: string };
  dispensary: { name: string } | null;
  likes: { userId: string }[];
  comments: {
    id: string;
    text: string;
    gifUrl: string | null;
    createdAt: Date;
    user: { name: string | null; image: string | null };
  }[];
}

interface ThoughtData {
  id: string;
  text: string;
  gifUrl: string | null;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null };
  strain: { name: string; type: string } | null;
  likes: { userId: string }[];
  comments: {
    id: string;
    text: string;
    gifUrl: string | null;
    createdAt: Date;
    user: { name: string | null; image: string | null };
  }[];
}

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id!;

  // Update last seen for badge notification tracking
  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenFeed: new Date() },
  });

  // Fetch entries and thoughts in parallel
  const [entries, thoughts] = await Promise.all([
    prisma.entry.findMany({
      include: {
        user: true,
        strain: true,
        dispensary: true,
        likes: { select: { userId: true } },
        comments: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.thought.findMany({
      include: {
        user: true,
        strain: true,
        likes: { select: { userId: true } },
        comments: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  // Merge and sort by date
  const feed: FeedItem[] = [
    ...entries.map((e) => ({
      type: "entry" as const,
      createdAt: e.createdAt,
      data: e as unknown as EntryData,
    })),
    ...thoughts.map((t) => ({
      type: "thought" as const,
      createdAt: t.createdAt,
      data: t as unknown as ThoughtData,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div>
      <h1 className="mb-4 bg-gradient-to-r from-primary to-hybrid bg-clip-text text-2xl font-extrabold text-transparent">
        Weedoloveweed
      </h1>

      {feed.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-4xl">🌿</p>
          <p className="mt-2 font-semibold text-foreground">Nothing here yet</p>
          <p className="text-sm text-muted">
            Be the first to log a session!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feed.map((item) => {
            if (item.type === "entry") {
              const e = item.data;
              const photos = e.photos as string[] | null;
              return (
                <FeedCard
                  key={`entry-${e.id}`}
                  id={e.id}
                  userName={e.user.name ?? "Unknown"}
                  userImage={e.user.image}
                  strainName={e.strain.name}
                  strainType={e.strain.type}
                  rating={e.rating}
                  method={e.method}
                  dispensaryName={e.dispensary?.name}
                  photoUrl={photos?.[0]}
                  gifUrl={e.gifUrl}
                  review={e.review}
                  createdAt={e.createdAt}
                  likeCount={e.likes.length}
                  liked={e.likes.some((l) => l.userId === userId)}
                  comments={e.comments.map((c) => ({
                    ...c,
                    createdAt: c.createdAt.toISOString(),
                  }))}
                  currentUserId={userId}
                />
              );
            } else {
              const t = item.data;
              return (
                <ThoughtCard
                  key={`thought-${t.id}`}
                  id={t.id}
                  userName={t.user.name ?? "Unknown"}
                  userImage={t.user.image}
                  text={t.text}
                  strainName={t.strain?.name}
                  strainType={t.strain?.type}
                  gifUrl={t.gifUrl}
                  createdAt={t.createdAt}
                  likeCount={t.likes.length}
                  liked={t.likes.some((l) => l.userId === userId)}
                  comments={t.comments.map((c) => ({
                    ...c,
                    createdAt: c.createdAt.toISOString(),
                  }))}
                  currentUserId={userId}
                />
              );
            }
          })}
        </div>
      )}

      <FABMenu />
    </div>
  );
}
