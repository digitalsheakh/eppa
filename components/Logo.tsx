export default function Logo({ className = '', width = 180 }: {
  className?: string;
  width?: number;
  height?: number;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/eppa_logo.png"
      alt="Eppa's Shop"
      width={width}
      className={`object-contain ${className}`}
      style={{ height: 'auto' }}
    />
  );
}
