"use client";

import { usePathname } from "next/navigation";
import FABMenu from "./FABMenu";

// Hide the FAB on pages that have their own inline actions
const HIDDEN_ON = ["/", "/search"];

export default function FABWrapper() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  return <FABMenu />;
}
