"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Feed", icon: "🏠" },
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/profile", label: "Profile", icon: "👤" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/count");
        const data = await res.json();
        setNotifCount(data.count ?? 0);
      } catch {
        // ignore
      }
    };
    fetchCount();
    const id = setInterval(fetchCount, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-card-border bg-card">
      <div className="mx-auto flex max-w-md justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const showDot =
            item.href === "/" && notifCount > 0 && pathname !== "/";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors ${
                isActive
                  ? "font-bold text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <span className="relative text-xl">
                {item.icon}
                {showDot && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-card" />
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
