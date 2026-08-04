"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { InstagramIcon, LinkedinIcon } from "@/components/ui/SocialIcons";
import { team as mockTeam, teamCrud } from "@/lib/data/team";
import { MemberGuard } from "@/components/MemberGuard";
import type { TeamMember, TeamRole } from "@/lib/types";

const GROUPS: { role: TeamRole; label: string }[] = [
  { role: "Founder", label: "Founder" },
  { role: "Admin", label: "Admins" },
  { role: "Moderator", label: "Moderators" },
];

const ICONS: Record<string, typeof InstagramIcon> = { Instagram: InstagramIcon, LinkedIn: LinkedinIcon };

export default function TeamPage() {
  return (
    <MemberGuard>
      <TeamContent />
    </MemberGuard>
  );
}

function TeamContent() {
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);

  useEffect(() => {
    teamCrud.fetchAll(mockTeam).then(setTeam);
  }, []);

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="The Council" title="Community Team" description="The people who keep King Warriors running, growing, and true to its standard." />

        {GROUPS.map((group) => {
          const members = team.filter((m) => m.role === group.role);
          if (members.length === 0) return null;
          return (
            <section key={group.role} className="mt-16">
              <h3 className="font-display text-xl text-[var(--color-ivory)]">{group.label}</h3>
              <div className="hairline mt-4 mb-8" />
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${group.role === "Founder" ? "lg:grid-cols-1 max-w-md" : "lg:grid-cols-3"} gap-6`}>
                {members.map((m) => (
                  <GlassCard key={m.id} className="text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.photoUrl}
                      alt={m.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto ring-2 ring-[var(--color-gold)]/40"
                    />
                    <h4 className="font-display text-lg mt-4 text-[var(--color-ivory)]">{m.name}</h4>
                    <p className="text-xs text-[var(--color-gold-bright)] font-mono uppercase tracking-wider mt-1">{m.title}</p>
                    <p className="mt-3 text-sm text-[var(--color-ash)] leading-relaxed">{m.bio}</p>
                    {m.socials && (
                      <div className="flex justify-center gap-3 mt-4">
                        {m.socials.map((s) => {
                          const Icon = ICONS[s.platform] ?? InstagramIcon;
                          return (
                            <a key={s.platform} href={s.url} aria-label={s.platform} className="glass rounded-full p-2 text-[var(--color-ash)] hover:text-[var(--color-gold-bright)] transition-colors">
                              <Icon size={14} />
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </GlassCard>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
