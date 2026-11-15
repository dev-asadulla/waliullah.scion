interface StudioLogoProps {
  studioName: string;
  logoMark?: string;
  logoImageUrl?: string;
  surface?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

export function StudioLogo({
  studioName,
  logoMark = 'VK',
  logoImageUrl,
  surface = 'light',
  size = 'md',
}: StudioLogoProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (logoImageUrl && logoImageUrl.trim().length > 0) {
    return (
      <span
        className={`inline-flex items-center justify-center ${sizeClass} p-1 bg-white shrink-0 ${
          surface === 'dark' ? 'border border-white/25' : 'border border-[#E5E5E5]'
        }`}
      >
        <img
          src={logoImageUrl}
          alt={`${studioName} logo`}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }

  const cleanMark = (logoMark || 'VK').trim().slice(0, 4) || 'VK';

  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center ${sizeClass} font-serif tracking-tight shrink-0 select-none ${
        surface === 'dark'
          ? 'border border-white/45 text-white bg-white/5'
          : 'border border-black text-black bg-white'
      }`}
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
      >
        <path d="M0 7H7M29 36V29" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="relative leading-none">{cleanMark}</span>
    </span>
  );
}
