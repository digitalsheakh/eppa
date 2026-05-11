import Image from 'next/image';

export default function Logo({ className = '', width = 180, height = 50 }: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/eppa_logo.png"
      alt="Eppa's Shop"
      width={width}
      height={height}
      className={`h-auto object-contain ${className}`}
      priority
    />
  );
}
