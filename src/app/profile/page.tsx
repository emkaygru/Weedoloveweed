import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PushToggle from "@/components/PushToggle";
import BookmarksList from "@/components/BookmarksList";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [entryCount, uniqueStrains, user, bookmarks] = await Promise.all([
    prisma.entry.count({ where: { userId: session.user.id } }),
    prisma.entry.findMany({
      where: { userId: session.user.id },
      select: { strainId: true },
      distinct: ["strainId"],
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { bookmarksPublic: true },
    }),
    prisma.bookmark.findMany({
      where: { userId: session.user.id },
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
  ]);

  return (
    <div>
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
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-card-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-primary">{entryCount}</p>
          <p className="text-xs text-muted">Sessions</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-sativa">
            {uniqueStrains.length}
          </p>
          <p className="text-xs text-muted">Strains</p>
        </div>
        <div className="rounded-xl border border-card-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-indica">{bookmarks.length}</p>
          <p className="text-xs text-muted">Bookmarks</p>
        </div>
      </div>

      {/* Saved strains */}
      <BookmarksList
        initialBookmarks={bookmarks}
        initialPublic={user?.bookmarksPublic ?? true}
      />

      {/* Notifications */}
      <div className="mt-4 rounded-xl border border-card-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold">Notifications</p>
        <PushToggle />
      </div>

      {/* Sign out */}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="mt-6"
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
