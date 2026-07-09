'use client';

import React, { useState, useEffect } from 'react';

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  fallbackSrc = '/avatar.webp',
  alt,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null | undefined>(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <img
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
