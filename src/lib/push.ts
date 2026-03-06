import webpush from "web-push";
import { prisma } from "@/lib/prisma";

interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

function initVapid() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

/**
 * Send a push notification to all subscriptions for a given user.
 * Silently removes stale/expired subscriptions (410 Gone).
 */
export async function sendPushToUser(userId: string, payload: PushPayload) {
  initVapid();
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (!subs.length) return;

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );

  // Clean up expired subscriptions
  const staleEndpoints: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const err = result.reason as { statusCode?: number };
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        staleEndpoints.push(subs[i].endpoint);
      }
    }
  });

  if (staleEndpoints.length) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: staleEndpoints } },
    });
  }
}

/**
 * Send a push notification to all users EXCEPT the given one (e.g. new post broadcast).
 */
export async function sendPushToAllExcept(excludeUserId: string, payload: PushPayload) {
  initVapid();
  const subs = await prisma.pushSubscription.findMany({
    where: { userId: { not: excludeUserId } },
  });
  if (!subs.length) return;

  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      )
    )
  );

  const staleEndpoints: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      const err = result.reason as { statusCode?: number };
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        staleEndpoints.push(subs[i].endpoint);
      }
    }
  });

  if (staleEndpoints.length) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: staleEndpoints } },
    });
  }
}
