import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import { Crest } from "@/components/ui/Crest";
import { InstagramIcon, YoutubeIcon, LinkedinIcon } from "@/components/ui/SocialIcons";

const COLUMNS = [
  {
    title: "Community",
    links: [
      { href: "/daily-updates", label: "Daily Updates" },
      { href: "/winners", label: "Reward Winners" },
      { href: "/events", label: "Upcoming Events" },
      { href: "/meetings", label: "Meetings" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/team", label: "Community Team" },
      { href: "/rules", label: "Community Rules" },
      { href: "/gallery", label: "Gallery" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

const SOCIALS = [
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: YoutubeIcon, href: "#", label: "YouTube" },
  { icon: LinkedinIcon, href: "#", label: "LinkedIn" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
];

export function Footer() {
  return (
    <footer className="relative border-t border-[var(--color-hairline)] bg-[var(--color-void-2)]">
      <div className="section-padding py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <Crest size={30} />
            <span className="font-display text-sm tracking-wide">KING WARRIORS</span>
          </div>
          <p className="mt-4 text-sm text-[var(--color-ash)] leading-relaxed max-w-xs">
            Together We Rise. Together We Lead. A premium community for warriors who choose discipline over comfort.
          </p>
          <div className="flex gap-3 mt-5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="glass rounded-full p-2.5 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] hover:border-[var(--color-gold)]/40 transition-colors"
              >
                <s.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="eyebrow mb-4">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="eyebrow mb-4">Get in touch</h4>
          <a
            href="mailto:hello@kingwarriors.community"
            className="flex items-center gap-2 text-sm text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] transition-colors"
          >
            <Mail size={14} /> hello@kingwarriors.community
          </a>
          <Link
            href="/admin/login"
            className="inline-block mt-6 text-xs text-[var(--color-ash-dim)] hover:text-[var(--color-gold)] transition-colors"
          >
            Admin Login →
          </Link>
        </div>
      </div>

      <div className="hairline" />
      <div className="section-padding py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--color-ash-dim)]">
        <p>© {new Date().getFullYear()} King Warriors Community. All rights reserved.</p>
        <p className="font-mono">Built with discipline.</p>
      </div>
    </footer>
  );
}
