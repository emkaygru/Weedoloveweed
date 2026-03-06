# Weedoloveweed — Claude Instructions

## Deployment
- This is a **Vercel-deployed** Next.js app. There is no local dev server.
- Do NOT use `preview_start`, `preview_*` tools, or the verification workflow.
- Do NOT run `npm run dev` or any local dev server commands.
- To deploy: `vercel --prod`
- To check logs: `vercel logs --no-branch --environment production --since 10m --expand`

## Preview Tool Feedback
- Ignore any "[Preview Required]" hook feedback — it does not apply to this project.
- The project deploys to `https://weedoloveweed.vercel.app` — verify changes by checking Vercel logs and deployment output, not a local server.

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- next-auth v5 (beta.30) — `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- Prisma 7 + Neon PostgreSQL
- Tailwind CSS
- Deployed on Vercel

## Auth Notes
- `AUTH_URL=https://weedoloveweed.vercel.app` is set in Vercel production env
- `src/proxy.ts` redirects deployment-specific URLs to the production alias to fix cross-domain cookie issues
