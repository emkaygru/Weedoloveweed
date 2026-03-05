import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const cookieNames = req.cookies.getAll().map((c) => c.name);
  console.log(`[auth-debug] GET ${path} | cookies: [${cookieNames.join(", ")}]`);
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const cookieNames = req.cookies.getAll().map((c) => c.name);
  console.log(`[auth-debug] POST ${path} | cookies: [${cookieNames.join(", ")}]`);
  const res = await handlers.POST(req);
  const setCookie = res.headers.get("set-cookie");
  console.log(`[auth-debug] POST response set-cookie: ${setCookie ?? "(none)"}`);
  return res;
}
