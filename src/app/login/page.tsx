import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <h1 className="bg-gradient-to-r from-primary via-sativa to-accent-pink bg-clip-text text-4xl font-extrabold text-transparent">
        Weedoloveweed
      </h1>
      <p className="mt-2 text-muted">Cannabis diary for the crew</p>

      <div className="mt-8">
        <GoogleSignInButton />
      </div>

      <p className="mt-6 max-w-xs text-xs text-muted">
        Only invited Gamily members can sign in. Ask the Gamily if you need access.
      </p>
    </div>
  );
}
