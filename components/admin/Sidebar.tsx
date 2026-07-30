"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Trophy,
  CalendarClock,
  Images,
  Users,
  ScrollText,
  CalendarDays,
  LogOut,
  ExternalLink,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import { Crest } from "@/components/ui/Crest";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/dashboard/winners", label: "Reward Winners", icon: Trophy },
  { href: "/admin/dashboard/events", label: "Events", icon: CalendarClock },
  { href: "/admin/dashboard/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/admin/dashboard/gallery", label: "Gallery", icon: Images },
  { href: "/admin/dashboard/team", label: "Team", icon: Users },
  { href: "/admin/dashboard/rules", label: "Rules", icon: ScrollText },
  { href: "/admin/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="w-full lg:w-64 shrink-0 lg:min-h-[calc(100vh-5rem)] glass lg:border-r lg:border-y-0 lg:border-l-0 flex lg:flex-col">
      <div className="hidden lg:flex items-center gap-2.5 px-6 py-6">
        <Crest size={26} />
        <span className="font-display text-xs tracking-wide">COUNCIL PANEL</span>
      </div>

      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible px-3 py-3 lg:py-0 flex-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-colors shrink-0",
                active
                  ? "bg-[var(--color-gold)]/12 text-[var(--color-gold-bright)]"
                  : "text-[var(--color-ash)] hover:text-[var(--color-ivory)] hover:bg-white/5"
              )}
            >
              <item.icon size={16} /> {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden lg:block p-4 border-t border-[var(--color-hairline)]">
        <div className="flex items-center gap-3 px-2 mb-3">
          {user?.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
          )}
          <div className="min-w-0">
            <p className="text-sm text-[var(--color-ivory)] truncate">{user?.name}</p>
            <p className="text-xs text-[var(--color-ash-dim)] capitalize">{user?.role}</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-2.5 px-2 py-2 text-xs text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] transition-colors">
          <ExternalLink size={14} /> View site
        </Link>
        <button
          onClick={async () => {
            await logout();
            toast.success("Signed out.");
            router.push("/admin/login");
          }}
          className="flex items-center gap-2.5 px-2 py-2 text-xs text-[var(--color-ash)] hover:text-[var(--color-danger)] transition-colors w-full cursor-pointer"
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}
