import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SearchClient from "@/components/SearchClient";

export default async function SearchPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Search Strains 🔍</h1>
      <SearchClient userId={session.user.id!} />
    </div>
  );
}
