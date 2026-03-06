"use client";

import { useEffect, useState } from "react";

type Status = "loading" | "unsupported" | "denied" | "subscribed" | "unsubscribed";

export default function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    // Check if already subscribed on server
    fetch("/api/push/subscribe")
      .then((r) => r.json())
      .then((data) => setStatus(data.subscribed ? "subscribed" : "unsubscribed"))
      .catch(() => setStatus("unsubscribed"));
  }, []);

  async function subscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // Pass as string — all modern browsers accept base64url directly
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      });

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      setStatus("subscribed");
    } catch (err) {
      console.error("Push subscribe error:", err);
      if (Notification.permission === "denied") setStatus("denied");
    }
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("unsubscribed");
    } catch (err) {
      console.error("Push unsubscribe error:", err);
    }
  }

  if (status === "loading") return null;

  if (status === "unsupported") {
    return (
      <p className="text-xs text-muted">
        🔔 Push notifications not supported in this browser
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-xs text-muted">
        🔕 Notifications blocked — enable in browser settings
      </p>
    );
  }

  return (
    <button
      onClick={status === "subscribed" ? unsubscribe : subscribe}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        status === "subscribed"
          ? "bg-primary/15 text-primary hover:bg-primary/25"
          : "bg-card-border/50 text-muted hover:bg-card-border hover:text-foreground"
      }`}
    >
      <span>{status === "subscribed" ? "🔔" : "🔕"}</span>
      <span>
        {status === "subscribed" ? "Notifications on" : "Enable notifications"}
      </span>
    </button>
  );
}

