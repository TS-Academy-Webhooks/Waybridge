import Image from "next/image";

export function BrandMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/waybridge-logo.png"
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
