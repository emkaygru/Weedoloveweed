import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StrainBadge from "@/components/StrainBadge";
import StarRating from "@/components/StarRating";
import { TERPENE_INFO } from "@/lib/terpenes";
import StrainActions from "@/components/StrainActions";
import BackButton from "@/components/BackButton";

export default async function StrainDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const strain = await prisma.strain.findUnique({
    where: { id },
    include: {
      entries: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!strain) notFound();

  const terpenes = strain.terpeneProfile as Record<string, number> | null;
  const effects = strain.effects as string[] | null;
  const flavors = strain.flavors as string[] | null;
  const avgRating = strain.entries.length
    ? strain.entries.reduce((sum, e) => sum + e.rating, 0) /
      strain.entries.length
    : null;

  // Sort terpenes by value descending
  const sortedTerpenes = terpenes
    ? Object.entries(terpenes).sort(([, a], [, b]) => b - a)
    : [];

  return (
    <div>
      <BackButton label="Back" fallbackHref="/" className="mb-4" />

      <div className="rounded-2xl border border-card-border bg-card p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{strain.name}</h1>
            <div className="mt-1 flex items-center gap-2">
              <StrainBadge type={strain.type} />
              {avgRating && (
                <div className="flex items-center gap-1">
                  <StarRating rating={Math.round(avgRating)} />
                  <span className="text-xs text-muted">
                    ({strain.entries.length})
                  </span>
                </div>
              )}
            </div>
          </div>
          {strain.imageUrl && (
            <img
              src={strain.imageUrl}
              alt={strain.name}
              className="h-20 w-20 rounded-xl object-cover"
            />
          )}
        </div>

        {/* THC / CBD */}
        {(strain.thcPercent || strain.cbdPercent) && (
          <div className="mt-4 flex gap-4">
            {strain.thcPercent && (
              <div className="rounded-lg bg-primary/10 px-3 py-1.5">
                <span className="text-xs text-muted">THC</span>
                <p className="font-bold text-primary">
                  {strain.thcPercent.toFixed(1)}%
                </p>
              </div>
            )}
            {strain.cbdPercent && (
              <div className="rounded-lg bg-indica/10 px-3 py-1.5">
                <span className="text-xs text-muted">CBD</span>
                <p className="font-bold text-indica">
                  {strain.cbdPercent.toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {strain.description && (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {strain.description}
          </p>
        )}

        {/* Effects */}
        {effects && effects.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase text-muted">
              Effects
            </h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {effects.map((effect) => (
                <span
                  key={effect}
                  className="rounded-full bg-sativa/10 px-2.5 py-0.5 text-xs font-medium text-sativa"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Flavors */}
        {flavors && flavors.length > 0 && (
          <div className="mt-3">
            <h3 className="text-xs font-semibold uppercase text-muted">
              Flavors
            </h3>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {flavors.map((flavor) => (
                <span
                  key={flavor}
                  className="rounded-full bg-accent-yellow/10 px-2.5 py-0.5 text-xs font-medium text-accent-yellow"
                >
                  {flavor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Terpene profile with explanations */}
        {sortedTerpenes.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold uppercase text-muted">
              Terpene Profile
            </h3>
            <div className="mt-2 space-y-3">
              {sortedTerpenes.map(([name, value]) => {
                const info =
                  TERPENE_INFO[name.toLowerCase()] ||
                  TERPENE_INFO[name.toLowerCase().replace(/[_-]/g, "")] ||
                  null;
                return (
                  <div key={name} className="rounded-xl bg-primary/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold capitalize">
                        {info?.emoji || "🌱"} {name}
                      </span>
                      <span className="text-xs font-medium text-muted">
                        {(value * 100).toFixed(1)}%
                      </span>
                    </div>
                    {/* Bar */}
                    <div className="mt-1.5 h-2 rounded-full bg-card-border">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-primary to-hybrid"
                        style={{
                          width: `${Math.min(value * 100, 100)}%`,
                        }}
                      />
                    </div>
                    {/* Description */}
                    {info && (
                      <div className="mt-2">
                        <p className="text-xs text-muted">
                          {info.description}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-primary">
                          {info.effects}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bookmark actions */}
        <StrainActions strainId={strain.id} strainName={strain.name} />
      </div>

      {/* Recent reviews */}
      {strain.entries.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold">Recent Reviews</h3>
          <div className="space-y-2">
            {strain.entries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-card-border bg-card p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">
                    {entry.user.name}
                  </span>
                  <StarRating rating={entry.rating} />
                </div>
                {entry.review && (
                  <p className="mt-1 text-sm text-muted">{entry.review}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
