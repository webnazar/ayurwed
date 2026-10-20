'use client';

import React, { useState, useEffect } from 'react';

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
  fallbackClassName?: string;
}

export default function SafeImage({
  src,
  fallbackSrc = '/avatar.webp',
  fallbackClassName,
  className,
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(src);
  const [isFailed, setIsFailed] = useState<boolean>(!src || src === fallbackSrc);

  useEffect(() => {
    setImgSrc(src);
    setIsFailed(!src || src === fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt}
      className={isFailed && fallbackClassName ? fallbackClassName : className}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
          setIsFailed(true);
        }
      }}
    />
  );
}
