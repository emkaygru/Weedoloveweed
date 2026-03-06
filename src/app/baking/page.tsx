import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BakingClient from "./BakingClient";

export default async function BakingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <BakingClient />;
}
