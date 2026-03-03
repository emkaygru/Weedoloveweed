import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ThoughtForm from "@/components/ThoughtForm";

export default async function NewThoughtPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">High Thought 💭</h1>
      <ThoughtForm />
    </div>
  );
}
