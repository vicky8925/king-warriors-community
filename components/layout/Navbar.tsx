"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { Crest } from "@/components/ui/Crest";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useMemberAuth } from "@/lib/memberAuth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/daily-updates", label: "Updates" },
  { href: "/winners", label: "Winners" },
  { href: "/events", label: "Events" },
  { href: "/meetings", label: "Meetings" },
  { href: "/gallery", label: "Gallery" },
  { href: "/team", label: "Team" },
  { href: "/rules", label: "Rules" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, verifySession, logout } = useMemberAuth();

  useEffect(() => {
    verifySession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    toast.success("Signed out.");
    router.push("/");
  }

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[var(--color-void)] border-b border-[var(--color-hairline)] shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      )}
    >
      <nav className="section-padding flex items-center justify-between h-16 sm:h-20">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Crest size={30} />
          <span className="font-display text-sm sm:text-base tracking-wide text-[var(--color-ivory)] group-hover:text-[var(--color-gold-bright)] transition-colors">
            KING WARRIORS
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative text-sm transition-colors py-1",
                  active ? "text-[var(--color-gold-bright)]" : "text-[var(--color-ash)] hover:text-[var(--color-ivory)]"
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--color-gold-bright)]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 glass rounded-full pl-2 pr-4 py-2 text-sm text-[var(--color-ivory)] hover:border-[var(--color-gold)]/40 transition-colors cursor-pointer"
              >
                <span className="rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold-bright)] p-1.5">
                  <User size={14} />
                </span>
                {user.name.split(" ")[0]}
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-44 glass-strong rounded-xl p-1.5 z-20"
                  >
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--color-ash)] hover:text-[var(--color-danger)] hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-[var(--color-ash)] hover:text-[var(--color-ivory)] transition-colors">
                Login
              </Link>
              <Button size="sm" onClick={() => (window.location.href = "/join")}>
                Join Community
              </Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-[var(--color-ivory)] p-2 -mr-2 cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-[var(--color-void)] border-t border-[var(--color-hairline)] overflow-hidden"
          >
            <div className="section-padding py-5 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "py-2.5 text-base border-b border-[var(--color-hairline)] last:border-0",
                    pathname === link.href ? "text-[var(--color-gold-bright)]" : "text-[var(--color-ash)]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="flex items-center gap-2 mt-4 text-sm text-[var(--color-ivory)]">
                    <span className="rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold-bright)] p-1.5">
                      <User size={14} />
                    </span>
                    Signed in as {user.name}
                  </div>
                  <Button variant="secondary" className="mt-3 w-full" onClick={handleLogout}>
                    <LogOut size={14} /> Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="py-2.5 text-base text-[var(--color-ash)]">
                    Login
                  </Link>
                  <Button className="mt-4 w-full" onClick={() => (window.location.href = "/join")}>
                    Join Community
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
