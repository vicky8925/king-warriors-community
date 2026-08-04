"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { gallery, galleryVideos, galleryCrud } from "@/lib/data/gallery";
import { cn } from "@/lib/utils";
import { MemberGuard } from "@/components/MemberGuard";
import type { GalleryItem } from "@/lib/types";

const mockItems: GalleryItem[] = [...gallery, ...galleryVideos];

export default function GalleryPage() {
  return (
    <MemberGuard>
      <GalleryContent />
    </MemberGuard>
  );
}

function GalleryContent() {
  const [allItems, setAllItems] = useState<GalleryItem[]>(mockItems);
  const [category, setCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    galleryCrud.fetchAll(mockItems).then(setAllItems);
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(allItems.map((g) => g.category)))], [allItems]);

  const filtered = useMemo(
    () => allItems.filter((g) => category === "All" || g.category === category),
    [allItems, category]
  );

  const active = activeIndex !== null ? filtered[activeIndex] : null;

  const go = (delta: number) => {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + delta + filtered.length) % filtered.length);
  };

  return (
    <div className="section-padding py-16 sm:py-24">
      <div className="max-w-6xl mx-auto">
        <SectionHeading eyebrow="Moments" title="Gallery" description="Photos and videos from summits, meetups, and everything in between." />

        <div className="flex flex-wrap gap-2 mt-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border",
                category === c
                  ? "bg-[var(--color-gold)]/15 border-[var(--color-gold)]/40 text-[var(--color-gold-bright)]"
                  : "border-[var(--color-hairline)] text-[var(--color-ash)] hover:text-[var(--color-ivory)]"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Masonry via CSS columns */}
        <div className="mt-10 columns-2 sm:columns-3 lg:columns-4 gap-4 [&>*]:mb-4">
          {filtered.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: (i % 8) * 0.04 }}
              onClick={() => setActiveIndex(i)}
              className="relative w-full block rounded-xl overflow-hidden break-inside-avoid group cursor-pointer"
              style={{ aspectRatio: `${item.width} / ${item.height}` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.thumbnailUrl ?? item.url}
                alt={item.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                <p className="text-xs text-white text-left">{item.caption}</p>
              </div>
              {item.type === "video" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <PlayCircle size={32} className="text-[var(--color-gold-bright)]" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/90 flex items-center justify-center p-4 sm:p-10"
            onClick={() => setActiveIndex(null)}
          >
            <button
              className="absolute top-5 right-5 text-white/80 hover:text-white cursor-pointer"
              onClick={() => setActiveIndex(null)}
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <button
              className="absolute left-3 sm:left-8 text-white/70 hover:text-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Previous"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              className="absolute right-3 sm:right-8 text-white/70 hover:text-white cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Next"
            >
              <ChevronRight size={32} />
            </button>

            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl w-full"
            >
              {active.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={active.url} alt={active.caption} className="w-full max-h-[80vh] object-contain rounded-lg mx-auto" />
              ) : (
                <div className="aspect-video w-full">
                  <iframe src={active.url} className="w-full h-full rounded-lg" allowFullScreen title={active.caption} />
                </div>
              )}
              <p className="text-center text-sm text-white/70 mt-4 font-mono">{active.caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
