"use client";

import { PLACEHOLDER, youtubeEmbed } from "@/lib/images";
import { Play } from "lucide-react";
import { useState, useEffect } from "react";

interface VideoBlockProps {
  url?: string;
  thumbnail?: string;
  title?: string;
  className?: string;
}

export function VideoBlock({ url, thumbnail, title = "School video", className }: VideoBlockProps) {
  const [playing, setPlaying] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(thumbnail || PLACEHOLDER.videoThumb);
  const embed = url ? youtubeEmbed(url) : PLACEHOLDER.videoPoster;

  useEffect(() => {
    setThumbSrc(thumbnail || PLACEHOLDER.videoThumb);
  }, [thumbnail]);

  if (!playing && url) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className={`group relative block w-full overflow-hidden rounded-3xl ${className || ""}`}
        aria-label={`Play ${title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbSrc}
          alt={title}
          className="aspect-video w-full object-cover"
          onError={() => {
            if (thumbSrc !== PLACEHOLDER.videoThumb) setThumbSrc(PLACEHOLDER.videoThumb);
            else if (thumbSrc !== PLACEHOLDER.default) setThumbSrc(PLACEHOLDER.default);
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/95 text-primary shadow-xl">
            <Play className="ml-1 h-8 w-8" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl ${className || ""}`}>
      <iframe
        src={embed}
        title={title}
        className="aspect-video w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
