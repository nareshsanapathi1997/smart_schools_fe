"use client";

import { useEffect, useState } from "react";
import { PLACEHOLDER, resolveMediaUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface BackgroundImageProps {
  src?: string | null;
  fallback?: string;
  className?: string;
  imgClassName?: string;
}

export function BackgroundImage({
  src,
  fallback = PLACEHOLDER.default,
  className,
  imgClassName,
}: BackgroundImageProps) {
  const [current, setCurrent] = useState(() => resolveMediaUrl(src, fallback));

  useEffect(() => {
    setCurrent(resolveMediaUrl(src, fallback));
  }, [src, fallback]);

  const handleError = () => {
    if (current !== fallback) setCurrent(fallback);
    else if (fallback !== PLACEHOLDER.default) setCurrent(PLACEHOLDER.default);
  };

  return (
    <div className={cn("absolute inset-0", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt=""
        aria-hidden
        onError={handleError}
        className={cn("img-subtle h-full w-full object-cover", imgClassName)}
      />
    </div>
  );
}
