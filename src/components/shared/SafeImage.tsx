"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PLACEHOLDER, resolveMediaUrl } from "@/lib/images";
import { cn } from "@/lib/utils";

interface SafeImageProps {
  src?: string | null;
  alt: string;
  fallback?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

function isHttpUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

export function SafeImage({
  src,
  alt,
  fallback,
  className,
  fill,
  width = 800,
  height = 600,
  priority,
}: SafeImageProps) {
  const fb = fallback || PLACEHOLDER.default;
  const emergency = PLACEHOLDER.default;

  const [imgSrc, setImgSrc] = useState(() => resolveMediaUrl(src, fb));
  const [stage, setStage] = useState<"primary" | "fallback" | "emergency">("primary");

  useEffect(() => {
    setImgSrc(resolveMediaUrl(src, fb));
    setStage("primary");
  }, [src, fb]);

  const handleError = useCallback(() => {
    if (stage === "primary") {
      setImgSrc(fb);
      setStage("fallback");
    } else if (stage === "fallback" && fb !== emergency) {
      setImgSrc(emergency);
      setStage("emergency");
    }
  }, [stage, fb, emergency]);

  const useNextImage = isHttpUrl(imgSrc);

  if (fill) {
    if (useNextImage) {
      return (
        <Image
          src={imgSrc}
          alt={alt}
          fill
          priority={priority}
          className={cn("object-cover", className)}
          onError={handleError}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt={alt}
        onError={handleError}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  if (useNextImage) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn("object-cover", className)}
        onError={handleError}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      onError={handleError}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={cn("object-cover", className)}
    />
  );
}
