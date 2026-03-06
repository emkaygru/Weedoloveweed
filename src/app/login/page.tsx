import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import LoginQuote from "@/components/LoginQuote";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <LoginQuote />
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
