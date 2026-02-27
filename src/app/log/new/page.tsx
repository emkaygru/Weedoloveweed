import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewLogPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Log a Session</h1>
      <div className="rounded-2xl border border-card-border bg-card p-6 text-center">
        <p className="text-muted">Entry form coming soon</p>
        <p className="mt-1 text-sm text-muted">
          Strain, rating, review, feelings, dispensary, photos
        </p>
      </div>
    </div>
  );
}
