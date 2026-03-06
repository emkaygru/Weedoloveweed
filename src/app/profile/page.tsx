import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PushToggle from "@/components/PushToggle";
import BookmarksList from "@/components/BookmarksList";
import SessionHeatMap from "@/components/SessionHeatMap";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id!;

  const [entryCount, uniqueStrains, user, bookmarks, entries, tBreak] = await Promise.all([
    prisma.entry.count({ where: { userId } }),
    prisma.entry.findMany({
      where: { userId },
      select: { strainId: true },
      distinct: ["strainId"],
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { bookmarksPublic: true },
    }),
    prisma.bookmark.findMany({
      where: { userId },
      include: {
        strain: {
          select: {
            id: true,
            name: true,
            type: true,
            thcPercent: true,
            cbdPercent: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.entry.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    }),
    prisma.tBreak.findFirst({
      where: { userId, endedAt: null },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  const sessionDates = entries.map((e) => e.createdAt.toISOString());
  const tBreakDays = tBreak
    ? Math.floor((Date.now() - new Date(tBreak.startedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-4">
      {/* Profile header */}
      <div className="rounded-2xl border border-card-border bg-card p-5 text-center">
        <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-primary-light/30">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name ?? ""}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">
              {(session.user.name ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h1 className="mt-2 text-lg font-bold">{session.user.name}</h1>
        <p className="text-sm text-muted">{session.user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-card-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{entryCount}</p>
          <p className="text-xs text-muted">Sessions</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-sativa">{uniqueStrains.length}</p>
          <p className="text-xs text-muted">Strains</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-indica">{bookmarks.length}</p>
          <p className="text-xs text-muted">Bookmarks</p>
        </div>
      </div>

      {/* Session Heat Map */}
      <div className="rounded-2xl border border-card-border bg-card p-4">
        <h2 className="mb-3 text-sm font-bold">Session Activity</h2>
        <SessionHeatMap dates={sessionDates} />
      </div>

      {/* T-Break card */}
      <Link href="/t-break" className="block">
        <div className="rounded-2xl border border-card-border bg-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors">
          <div>
            <p className="font-semibold text-sm">
              {tBreakDays !== null ? "🧘 T-Break Active" : "🧘 T-Break Tracker"}
            </p>
            <p className="text-xs text-muted">
              {tBreakDays !== null
                ? `Day ${tBreakDays} — staying clean 🌱`
                : "Track your tolerance resets"}
            </p>
          </div>
          {tBreakDays !== null ? (
            <span className="text-2xl font-extrabold text-primary">{tBreakDays}d</span>
          ) : (
            <span className="text-lg text-muted">→</span>
          )}
        </div>
      </Link>

      {/* Saved strains */}
      <BookmarksList
        initialBookmarks={bookmarks}
        initialPublic={user?.bookmarksPublic ?? true}
      />

      {/* Notifications */}
      <div className="rounded-xl border border-card-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold">Notifications</p>
        <PushToggle />
      </div>

      {/* Sign out */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="w-full rounded-xl border border-card-border bg-card py-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          Sign Out
        </button>
      </form>
    </div>
  );
}
