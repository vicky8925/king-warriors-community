import type { CommunityRule, FAQItem } from "@/lib/types";
import { createCrud } from "@/lib/supabaseCrud";

interface RuleRow {
  id: string;
  order: number;
  title: string;
  description: string;
}

function fromRow(row: RuleRow): CommunityRule {
  return { id: row.id, order: row.order, title: row.title, description: row.description };
}

function toRow(item: Partial<CommunityRule>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (item.order !== undefined) row.order = item.order;
  if (item.title !== undefined) row.title = item.title;
  if (item.description !== undefined) row.description = item.description;
  return row;
}

export const rulesCrud = createCrud<CommunityRule, RuleRow>("community_rules", toRow, fromRow, {
  column: "order",
  ascending: true,
});

// Seed / fallback data — used directly when Supabase isn't configured yet.
export const rules: CommunityRule[] = [
  {
    id: "r1",
    order: 1,
    title: "Lead with respect",
    description: "Every warrior treats every other warrior with respect — regardless of rank, tenure, or background.",
  },
  {
    id: "r2",
    order: 2,
    title: "No spam or self-promotion",
    description: "Do not post unsolicited promotions, referral links, or unrelated business pitches in community channels.",
  },
  {
    id: "r3",
    order: 3,
    title: "Show up with discipline",
    description: "Attend what you register for. Consistent no-shows affect your standing for rewards and events.",
  },
  {
    id: "r4",
    order: 4,
    title: "Keep it constructive",
    description: "Disagreements are welcome. Personal attacks, harassment, and toxicity are not tolerated.",
  },
  {
    id: "r5",
    order: 5,
    title: "Protect member privacy",
    description: "Never share another member's personal information without explicit consent.",
  },
  {
    id: "r6",
    order: 6,
    title: "Rewards are earned, not entitled",
    description: "Winner selections follow transparent criteria set by the council — decisions are final.",
  },
];

export const faqs: FAQItem[] = [
  {
    id: "f1",
    question: "How do I join King Warriors Community?",
    answer: "Tap Join Community on the homepage and complete the short application. Most applications are reviewed within 48 hours.",
  },
  {
    id: "f2",
    question: "Is membership free?",
    answer: "Yes, core membership is free. Certain premium events like the Leadership Bootcamp may have a nominal fee to cover venue costs.",
  },
  {
    id: "f3",
    question: "How are weekly and monthly winners chosen?",
    answer: "The council reviews engagement, referrals, and event contributions each period against published criteria — see the Reward Winners page for current categories.",
  },
  {
    id: "f4",
    question: "Can I start a new chapter in my city?",
    answer: "Yes — active members with six months tenure can apply to the council to launch a new chapter. Reach out via the Contact page.",
  },
  {
    id: "f5",
    question: "What happens if I break a community rule?",
    answer: "Minor issues receive a moderator warning. Repeated or severe violations can result in suspension or removal at council discretion.",
  },
];
