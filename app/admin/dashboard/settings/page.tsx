"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PowerOff, Power } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { FormField, inputClass } from "@/components/admin/Modal";
import { fetchSiteSettings, updateSiteSettings, defaultSiteSettings, type SiteSettings } from "@/lib/data/settings";
import { countMembers } from "@/lib/data/members";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
    countMembers().then(setMemberCount);
  }, []);

  async function toggleMaintenance() {
    if (!isSupabaseConfigured) {
      toast.error("Connect Supabase first — maintenance mode needs a live database to work across all visitors.");
      return;
    }
    setSaving(true);
    const next = !settings.maintenanceMode;
    const ok = await updateSiteSettings({ maintenanceMode: next });
    setSaving(false);
    if (!ok) {
      toast.error("Couldn't update maintenance mode — try logging out and back in.");
      return;
    }
    setSettings((s) => ({ ...s, maintenanceMode: next }));
    toast.success(next ? "Maintenance mode is ON — the public site now shows the maintenance page." : "Maintenance mode is OFF — the site is live again.");
  }

  async function saveMessage() {
    setSaving(true);
    const ok = await updateSiteSettings({ maintenanceMessage: settings.maintenanceMessage });
    setSaving(false);
    if (!ok) {
      toast.error("Couldn't save the message — try logging out and back in.");
      return;
    }
    toast.success("Maintenance message updated.");
  }

  async function saveStats() {
    setSaving(true);
    const ok = await updateSiteSettings({
      activeMembers: settings.activeMembers,
      chapters: settings.chapters,
    });
    setSaving(false);
    if (!ok) {
      toast.error("Couldn't save stats — try logging out and back in.");
      return;
    }
    toast.success("Community stats updated.");
  }

  return (
    <div>
      <AdminPageHeader title="Settings" description="Site-wide controls, including maintenance mode." />

      <GlassCard hover={false} className="max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg text-[var(--color-ivory)]">Maintenance Mode</h3>
            <p className="text-sm text-[var(--color-ash)] mt-1 max-w-md">
              When ON, every visitor sees a "back soon" page instead of the site. Admins can still log in here to turn it back off.
            </p>
          </div>
          <span
            className={`shrink-0 text-xs font-mono uppercase px-3 py-1.5 rounded-full ${
              settings.maintenanceMode
                ? "bg-[var(--color-danger)]/15 text-[var(--color-danger)]"
                : "bg-[var(--color-success)]/15 text-[var(--color-success)]"
            }`}
          >
            {loading ? "…" : settings.maintenanceMode ? "Site is OFFLINE" : "Site is LIVE"}
          </span>
        </div>

        <Button
          className="mt-6"
          variant={settings.maintenanceMode ? "secondary" : "danger"}
          onClick={toggleMaintenance}
          disabled={loading || saving}
        >
          {settings.maintenanceMode ? (
            <>
              <Power size={16} /> Turn Site Back On
            </>
          ) : (
            <>
              <PowerOff size={16} /> Turn On Maintenance Mode
            </>
          )}
        </Button>

        <div className="hairline my-6" />

        <FormField label="Message shown to visitors">
          <textarea
            className={inputClass + " min-h-[100px]"}
            value={settings.maintenanceMessage}
            onChange={(e) => setSettings((s) => ({ ...s, maintenanceMessage: e.target.value }))}
          />
        </FormField>
        <Button variant="secondary" onClick={saveMessage} disabled={saving}>
          Save Message
        </Button>
      </GlassCard>

      <GlassCard hover={false} className="max-w-2xl mt-6">
        <h3 className="font-display text-lg text-[var(--color-ivory)]">Community Stats</h3>
        <p className="text-sm text-[var(--color-ash)] mt-1 max-w-md">
          Shown on the homepage and admin overview. Total Members is a live count of real signups from the /join
          page — it updates on its own. Active Members and Chapters are set manually. Events, Winners, Updates, and
          Gallery counts update automatically from your data.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <FormField label="Total Members (live)">
            <div className={inputClass + " flex items-center text-[var(--color-gold-bright)]"}>{memberCount.toLocaleString()}</div>
          </FormField>
          <FormField label="Active Members">
            <input
              type="number"
              className={inputClass}
              value={settings.activeMembers}
              onChange={(e) => setSettings((s) => ({ ...s, activeMembers: Number(e.target.value) }))}
            />
          </FormField>
          <FormField label="Chapters">
            <input
              type="number"
              className={inputClass}
              value={settings.chapters}
              onChange={(e) => setSettings((s) => ({ ...s, chapters: Number(e.target.value) }))}
            />
          </FormField>
        </div>
        <Button variant="secondary" onClick={saveStats} disabled={saving}>
          Save Stats
        </Button>
      </GlassCard>
    </div>
  );
}
