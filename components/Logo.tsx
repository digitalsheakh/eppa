import Image from 'next/image';

export default function Logo({ className = '', width = 180, height = 40 }: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    <Image
      src="/logo.png"
      alt="TakeawayBag.co.uk"
      width={width}
      height={height}
      className={`h-auto object-contain ${className}`}
      priority
    />
  );
}
