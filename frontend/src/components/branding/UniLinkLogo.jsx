import logoImage from '../../assets/unilink-logo.png';

export default function UniLinkLogo({ size = 'medium', className = '' }) {
  const sizes = {
    small: { image: 'h-10', text: 'text-2xl' },
    medium: { image: 'h-16 sm:h-20', text: 'text-5xl sm:text-6xl' },
    large: { image: 'h-20 lg:h-24', text: 'text-6xl xl:text-7xl' },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <img
        src={logoImage}
        alt="UniLink Logo"
        className={`${currentSize.image} w-auto object-contain rounded-2xl`}
      />
      <span
        translate="no"
        className={`notranslate ${currentSize.text} font-black tracking-tight inline-flex items-center`}
      >
        <span className="bg-gradient-to-b from-[#525B67] via-[#38414D] to-[#2B323B] bg-clip-text text-transparent">
          Uni
        </span>
        <span className="text-[#FFC72C]">Link</span>
      </span>
    </div>
  );
}
