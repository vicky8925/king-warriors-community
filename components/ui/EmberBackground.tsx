"use client";

import { useEffect, useState } from "react";

interface Ember {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: string;
}

/**
 * Ambient rising-ember particle field. Deliberately quiet: small, slow,
 * low-opacity gold dots drifting up behind the hero — evokes a torch-lit
 * battlefield without competing with the headline.
 *
 * Particle positions are randomized, so they're generated client-side only
 * (inside useEffect, after mount) rather than during render. Generating
 * them during render would produce different random values on the server
 * vs. the client, causing a React hydration mismatch.
 */
export function EmberBackground({ count = 26 }: { count?: number }) {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    setEmbers(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 9 + Math.random() * 10,
        delay: Math.random() * 12,
        drift: `${(Math.random() - 0.5) * 120}px`,
      }))
    );
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {embers.map((e) => (
        <span
          key={e.id}
          className="ember"
          style={{
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            // @ts-expect-error custom property for keyframe drift
            "--drift": e.drift,
          }}
        />
      ))}
    </div>
  );
}
