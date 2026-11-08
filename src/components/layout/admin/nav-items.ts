import { FolderKanban, LayoutDashboard, Sparkles, type LucideIcon } from "lucide-react";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon };

/** Single source for the desktop sidebar and the mobile navigation sheet. */
export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
];
