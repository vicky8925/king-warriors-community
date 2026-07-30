"use client";

import { useEffect, useState } from "react";
import { Crest } from "@/components/ui/Crest";
import { EmberBackground } from "@/components/ui/EmberBackground";
import { fetchSiteSettings, defaultSiteSettings } from "@/lib/data/settings";

export default function MaintenancePage() {
  const [message, setMessage] = useState(defaultSiteSettings.maintenanceMessage);

  useEffect(() => {
    fetchSiteSettings().then((s) => setMessage(s.maintenanceMessage));
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--color-void)]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(201,162,39,0.14),transparent)]" />
      <EmberBackground count={20} />

      <div className="relative z-10 text-center px-6 max-w-lg">
        <div className="flex justify-center">
          <Crest size={64} animate />
        </div>
        <span className="eyebrow mt-6 block">King Warriors Community</span>
        <h1 className="font-display mt-4 text-3xl sm:text-4xl text-[var(--color-ivory)] leading-tight">
          We&apos;re Sharpening Things Behind the Scenes
        </h1>
        <p className="mt-5 text-[var(--color-ash)] leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
