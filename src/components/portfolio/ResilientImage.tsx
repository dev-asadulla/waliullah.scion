import { useEffect, useState } from 'react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
  fallbackTitle,
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt || fallbackTitle || 'Architectural photograph'}
        className="w-full h-full min-h-[260px] bg-[#222222] text-white/70 flex flex-col items-center justify-center p-6 text-center select-none"
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          className="mb-3 opacity-60"
        >
          <rect x="2" y="2" width="32" height="32" stroke="currentColor" strokeWidth="1.2" />
          <path d="M2 24L13 13L23 22L28 17L34 24" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className="text-xs tracking-wider uppercase text-white/60">
          {fallbackTitle || alt || 'Architectural Study'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
