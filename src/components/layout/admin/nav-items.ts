import {
  Briefcase,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shows the unread message count next to the label. */
  showUnread?: boolean;
};

/** Single source for the desktop sidebar and the mobile navigation sheet. */
export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, showUnread: true },
];
